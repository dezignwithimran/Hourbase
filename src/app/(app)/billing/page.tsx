"use client";

import { Button } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/feedback";
import { SegmentedControl } from "@/components/ui/tabs";
import { ProBadge } from "@/components/ui/pro-badge";
import { Check, Sparkles } from "@/components/ui/icons";
import {
  PLANS,
  formatRenewsAt,
  getPlan,
  isPaidPlan,
  planPriceLabel,
  usage,
  yearlyMonthlyEquivalent,
} from "@/lib/billing";
import { openPaddleCheckout } from "@/lib/paddle-checkout";
import type { PlanId, PlanInterval, Profile } from "@/lib/types";
import { useStore } from "@/lib/store/provider";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

type PaddleStatus = {
  configured?: boolean;
  clientToken?: string;
  env?: "sandbox" | "production";
  prices?: Record<string, Record<string, string>>;
};

export default function BillingPage() {
  const { profile, projects, clients, invoices, changePlan, updateProfile, usingSupabase } = useStore();
  const [interval, setInterval] = useState<PlanInterval>(profile?.planInterval ?? "monthly");
  const [pending, setPending] = useState<{ plan: PlanId; interval: PlanInterval } | null>(null);
  const [busy, setBusy] = useState(false);
  const [stripeOn, setStripeOn] = useState(false);
  const [paddle, setPaddle] = useState<PaddleStatus | null>(null);

  useEffect(() => {
    fetch("/api/paddle/status")
      .then((r) => r.json())
      .then((d: PaddleStatus) => setPaddle(d.configured ? d : null))
      .catch(() => setPaddle(null));
    fetch("/api/stripe/status")
      .then((r) => r.json())
      .then((d: { configured?: boolean }) => setStripeOn(Boolean(d.configured)))
      .catch(() => setStripeOn(false));
  }, []);

  useEffect(() => {
    if (!profile) return;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");
    if (!checkout) return;
    window.history.replaceState({}, "", "/billing");
    if (checkout === "canceled") {
      toast("Checkout canceled", "info");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/stripe/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not refresh plan");
        if (data.plan) {
          await updateProfile({
            plan: data.plan,
            planInterval: data.planInterval,
            planStatus: data.planStatus,
            planRenewsAt: data.planRenewsAt,
            stripeCustomerId: data.stripeCustomerId,
            stripeSubscriptionId: data.stripeSubscriptionId,
          } as Partial<Profile>);
        }
        toast(data.plan === "free" ? "You’re on the Free plan" : `${getPlan(data.plan).name} is active`);
      } catch (e) {
        toast(e instanceof Error ? e.message : "Could not refresh plan", "error");
      }
    })();
  }, [profile, updateProfile]);

  if (!profile) return null;
  const account = profile;

  const current = getPlan(account.plan);
  const projectUsage = usage("projects", projects.length, account.plan);
  const clientUsage = usage("clients", clients.length, account.plan);
  const invoiceUsage = usage("invoices", invoices.length, account.plan);
  const renews = formatRenewsAt(account.planRenewsAt);
  const paddleOn = Boolean(paddle?.configured && paddle.clientToken);
  const paidLive = usingSupabase && (paddleOn || stripeOn);
  const processor = paddleOn ? "Paddle" : stripeOn ? "Stripe" : null;
  const hasCustomer = Boolean(account.paddleCustomerId || account.stripeCustomerId);

  async function applyPaddlePatch(data: Partial<Profile>) {
    if (!data.plan) return;
    await updateProfile({
      plan: data.plan,
      planInterval: data.planInterval,
      planStatus: data.planStatus,
      planRenewsAt: data.planRenewsAt,
      paddleCustomerId: data.paddleCustomerId,
      paddleSubscriptionId: data.paddleSubscriptionId,
    } as Partial<Profile>);
  }

  async function startPaddleCheckout(plan: PlanId, nextInterval: PlanInterval) {
    const priceId = paddle?.prices?.[plan]?.[nextInterval];
    if (!paddle?.clientToken || !priceId) {
      throw new Error(`Add a Paddle price ID for ${getPlan(plan).name} ${nextInterval}.`);
    }
    setBusy(true);
    await openPaddleCheckout({
      token: paddle.clientToken,
      env: paddle.env === "production" ? "production" : "sandbox",
      priceId,
      email: account.email,
      userId: account.id,
      plan,
      interval: nextInterval,
      async onComplete(transactionId) {
        try {
          const res = await fetch("/api/paddle/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Could not refresh plan");
          await applyPaddlePatch(data);
          toast(`${getPlan(data.plan ?? plan).name} is active`);
        } catch (e) {
          toast(e instanceof Error ? e.message : "Payment received — refresh if the plan hasn’t updated", "error");
        } finally {
          setBusy(false);
        }
      },
      onClosed() {
        setBusy(false);
      },
    });
  }

  async function startStripeCheckout(plan: PlanId, nextInterval: PlanInterval) {
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval: nextInterval }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout");
      window.location.href = data.url;
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not start checkout", "error");
      setBusy(false);
    }
  }

  async function startCheckout(plan: PlanId, nextInterval: PlanInterval) {
    try {
      if (paddleOn) {
        await startPaddleCheckout(plan, nextInterval);
        return;
      }
      await startStripeCheckout(plan, nextInterval);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not start checkout", "error");
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    try {
      const path = account.paddleCustomerId || paddleOn ? "/api/paddle/portal" : "/api/stripe/portal";
      const res = await fetch(path, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not open billing portal");
      window.location.href = data.url;
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not open billing portal", "error");
      setBusy(false);
    }
  }

  async function apply(plan: PlanId, nextInterval: PlanInterval) {
    setBusy(true);
    try {
      await changePlan(plan, nextInterval);
      toast(
        plan === "free"
          ? "You’re on the Free plan"
          : `${getPlan(plan).name} is active${nextInterval === "yearly" ? " (yearly)" : ""}`,
      );
      setPending(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update plan", "error");
    } finally {
      setBusy(false);
    }
  }

  function choose(plan: PlanId) {
    if (plan === account.plan && interval === account.planInterval && account.planStatus === "active") {
      toast("You’re already on this plan", "info");
      return;
    }
    if (paidLive && isPaidPlan(plan)) {
      void startCheckout(plan, interval);
      return;
    }
    if (paidLive && plan === "free") {
      if (hasCustomer) {
        void openPortal();
        return;
      }
    }
    setPending({ plan, interval });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan & billing"
        description="Free includes 3 projects. Upgrade when you need unlimited workspace."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {paidLive && hasCustomer ? (
              <Button variant="outline" size="sm" disabled={busy} onClick={() => void openPortal()}>
                Manage payment
              </Button>
            ) : null}
            <SegmentedControl
              options={[
                { id: "monthly", label: "Monthly" },
                { id: "yearly", label: "Yearly · save 25%" },
              ]}
              value={interval}
              onChange={(id) => setInterval(id as PlanInterval)}
            />
          </div>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-text-tertiary uppercase">
            Current plan
          </p>
          <p className="mt-1 text-lg font-semibold text-text">
            {current.name}
            {isPaidPlan(profile.plan) ? (
              <span className="ml-2 text-sm font-medium text-text-secondary">
                {planPriceLabel(current, profile.planInterval)}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {isPaidPlan(profile.plan) && renews
              ? `Renews ${renews}.${paidLive ? "" : " Demo checkout — no card is charged."}`
              : "Free accounts can track 3 projects, 3 clients, and 5 invoices."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <UsageChip label={projectUsage.label} hot={projectUsage.atLimit} />
          <UsageChip label={clientUsage.label} hot={clientUsage.atLimit} />
          <UsageChip label={invoiceUsage.label} hot={invoiceUsage.atLimit} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const active = profile.plan === plan.id;
          const price =
            plan.id === "free"
              ? "$0"
              : interval === "yearly"
                ? `$${yearlyMonthlyEquivalent(plan)}`
                : `$${plan.monthly}`;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-panel border bg-surface p-5 card-surface",
                active ? "border-primary ring-2 ring-primary/15" : "border-border",
                plan.popular && !active && "border-primary/40",
              )}
            >
              {plan.popular ? (
                <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Sparkles className="h-3 w-3" /> Most chosen
                </span>
              ) : null}
              <p className="text-sm font-semibold text-text">{plan.name}</p>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="num text-3xl font-semibold text-text">{price}</span>
                {plan.id !== "free" ? (
                  <span className="text-sm text-text-secondary">/month</span>
                ) : (
                  <span className="text-sm text-text-secondary">forever</span>
                )}
              </p>
              {plan.id !== "free" && interval === "yearly" ? (
                <p className="mt-1 text-xs text-text-secondary">
                  Billed {planPriceLabel(plan, "yearly")}
                </p>
              ) : (
                <p className="mt-1 text-xs text-text-secondary">{plan.blurb}</p>
              )}
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span>{feature.label}</span>
                      {feature.pro ? <ProBadge /> : null}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={active ? "outline" : plan.popular ? "primary" : "secondary"}
                disabled={busy || (active && interval === profile.planInterval)}
                onClick={() => choose(plan.id)}
              >
                {active && interval === profile.planInterval
                  ? "Current plan"
                  : active
                    ? `Switch to ${interval}`
                    : plan.id === "free"
                      ? paidLive
                        ? "Manage / downgrade"
                        : "Downgrade to Free"
                      : paidLive
                        ? `Pay for ${plan.name}`
                        : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-text-secondary">
        {paidLive && processor
          ? `Paid plans are charged securely through ${processor}. Free stays limited to 3 projects.`
          : usingSupabase
            ? "Add Paddle keys to .env.local to charge cards. Until then, plan changes are a demo."
            : "Local demo mode — the selected plan is stored in this browser only."}
      </p>

      <ConfirmDialog
        open={Boolean(pending)}
        title={
          pending?.plan === "free"
            ? "Switch to Free?"
            : `Activate ${pending ? getPlan(pending.plan).name : ""}?`
        }
        description={
          pending?.plan === "free"
            ? "You keep existing projects, clients, and invoices. New ones are blocked until you’re back under the Free limits (3 projects, 3 clients, 5 invoices)."
            : "This demo activates the plan immediately. No card is charged until Paddle keys are added."
        }
        confirmLabel={pending?.plan === "free" ? "Switch to Free" : "Activate plan"}
        onCancel={() => setPending(null)}
        onConfirm={() => pending && apply(pending.plan, pending.interval)}
      />
    </div>
  );
}

function UsageChip({ label, hot }: { label: string; hot?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium",
        hot ? "bg-warning-soft text-warning" : "bg-muted text-text-secondary",
      )}
    >
      {label}
    </span>
  );
}
