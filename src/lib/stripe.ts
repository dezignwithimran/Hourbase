import { createHmac, timingSafeEqual } from "crypto";
import { getPlan, isPlanId, isPlanInterval, planPrice } from "@/lib/billing";
import type { PlanId, PlanInterval, PlanStatus } from "@/lib/types";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_"));
}

function secret() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) throw new Error("Stripe is not configured.");
  return key;
}

export type StripeMetadata = Record<string, string>;

export type StripeSubscription = {
  id: string;
  status: string;
  customer: string | { id: string };
  metadata: StripeMetadata;
  items: { data: { current_period_end?: number }[] };
  current_period_end?: number;
};

export type StripeCheckoutSession = {
  id: string;
  mode: string;
  payment_status: string;
  client_reference_id: string | null;
  customer: string | { id: string } | null;
  subscription: string | StripeSubscription | null;
  metadata: StripeMetadata | null;
};

export type PlanPatch = {
  plan: PlanId;
  planInterval: PlanInterval;
  planStatus: PlanStatus;
  planRenewsAt: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
};

export function planAmountCents(plan: PlanId, interval: PlanInterval) {
  return Math.round(planPrice(getPlan(plan), interval) * 100);
}

export function planFromMetadata(data: StripeMetadata | null | undefined): {
  plan: PlanId;
  interval: PlanInterval;
} | null {
  const plan = data?.plan;
  const interval = data?.interval;
  if (!isPlanId(plan) || plan === "free" || !isPlanInterval(interval)) return null;
  return { plan, interval };
}

function customerId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function patchFromSubscription(sub: StripeSubscription): PlanPatch {
  const meta = planFromMetadata(sub.metadata);
  const active = sub.status === "active" || sub.status === "trialing";
  const end = sub.items.data[0]?.current_period_end ?? sub.current_period_end;
  const renews = end ? new Date(end * 1000).toISOString() : null;
  const stripeCustomerId = customerId(sub.customer);
  if (!active || !meta) {
    return {
      plan: "free",
      planInterval: "monthly",
      planStatus: sub.status === "canceled" ? "canceled" : "active",
      planRenewsAt: null,
      stripeCustomerId,
      stripeSubscriptionId: sub.id,
    };
  }
  return {
    plan: meta.plan,
    planInterval: meta.interval,
    planStatus: "active",
    planRenewsAt: renews,
    stripeCustomerId,
    stripeSubscriptionId: sub.id,
  };
}

export async function stripeRequest<T>(
  method: "GET" | "POST",
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`https://api.stripe.com${path}`);
  const headers: Record<string, string> = { Authorization: `Bearer ${secret()}` };
  let body: string | undefined;
  if (method === "GET" && params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  } else if (method === "POST" && params) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(params).toString();
  }
  const res = await fetch(url, { method, headers, body });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message || "Stripe request failed.");
  }
  return json;
}

export function verifyStripeWebhook(payload: string, header: string, webhookSecret: string) {
  const parts = Object.fromEntries(
    header.split(",").map((part) => {
      const [k, ...rest] = part.split("=");
      return [k.trim(), rest.join("=")];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) throw new Error("Invalid Stripe signature.");
  const expected = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid Stripe signature.");
  }
}
