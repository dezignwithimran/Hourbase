"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, TimezoneSelect } from "@/components/ui/input";
import { BrandMark } from "@/components/ui/avatar";
import { SegmentedControl } from "@/components/ui/tabs";
import { useStore } from "@/lib/store/provider";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { CURRENCIES } from "@/lib/timezones";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const steps = [
  { id: "workspace", label: "Workspace" },
  { id: "project", label: "First project" },
] as const;

export default function OnboardingPage() {
  const { ready, user, profile, completeOnboarding } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [rate, setRate] = useState("75");
  const [currency, setCurrency] = useState("USD");
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [billingType, setBillingType] = useState<"hourly" | "fixed">("hourly");

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    if (profile) {
      setName(profile.name);
      setTimezone(profile.timezone);
      setRate(String(profile.defaultHourlyRate));
      setCurrency(profile.currency);
    }
  }, [ready, user, profile, router]);

  function profilePatch() {
    return {
      name: name.trim(),
      timezone,
      currency,
      defaultHourlyRate: Number(rate) || 0,
    };
  }

  async function finish(withProject: boolean) {
    if (!name.trim()) {
      toast("Add your name to continue", "error");
      setStep(0);
      return;
    }
    if (withProject && (!projectName.trim() || !clientName.trim())) {
      toast("Add a project and client, or skip this step", "error");
      return;
    }
    setBusy(true);
    try {
      await completeOnboarding({
        profile: profilePatch(),
        hourlyRate: Number(rate) || 0,
        billingType,
        ...(withProject
          ? { projectName: projectName.trim(), clientName: clientName.trim() }
          : {}),
      });
      toast(withProject ? "You're ready to track" : "Workspace saved");
      router.replace("/dashboard");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not finish setup", "error");
    } finally {
      setBusy(false);
    }
  }

  const current = steps[step].id;

  return (
    <div className="flex min-h-screen flex-col app-canvas">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-sm font-semibold text-text">Hourbase</span>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-text-secondary transition hover:text-text disabled:opacity-50"
          disabled={busy}
          onClick={() => finish(false)}
        >
          Skip for now
        </button>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-lg">
          <ol className="mb-8 flex items-center gap-2">
            {steps.map((s, i) => (
              <li key={s.id} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition",
                    i < step && "bg-primary text-white",
                    i === step && "bg-primary text-white ring-4 ring-primary/15",
                    i > step && "bg-muted text-text-tertiary",
                    i < step && "cursor-pointer hover:brightness-110",
                  )}
                  aria-label={s.label}
                  aria-current={i === step ? "step" : undefined}
                >
                  {i + 1}
                </button>
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "h-0.5 flex-1 rounded-full transition",
                      i < step ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </li>
            ))}
          </ol>

          <div className="animate-slide-up rounded-panel border border-border bg-surface p-8 card-surface">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Step {step + 1} of {steps.length} · {steps[step].label}
            </p>

            <form
                className="space-y-4"
                hidden={current !== "workspace"}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!name.trim()) {
                    toast("Add your name to continue", "error");
                    return;
                  }
                  setStep(1);
                }}
              >
                <div>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">
                    Set up your workspace
                  </h1>
                  <p className="mt-2 text-sm text-text-secondary">
                    Name, timezone, and the rate new projects start with. You can change these
                    later in Settings.
                  </p>
                </div>
                <Field label="Name">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </Field>
                <Field label="Timezone" hint="Used to group your days correctly.">
                  <TimezoneSelect value={timezone} onChange={setTimezone} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                  <Field label="Default hourly rate">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                    />
                  </Field>
                  <Field label="Currency">
                    <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      {CURRENCIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div className="pt-2">
                  <Button type="submit">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>

            <form
                className="space-y-4"
                hidden={current !== "project"}
                onSubmit={(e) => {
                  e.preventDefault();
                  void finish(true);
                }}
              >
                <div>
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">
                    Create your first project
                  </h1>
                  <p className="mt-2 text-sm text-text-secondary">
                    Timers need a project and a client. Skip if you would rather add them from the
                    dashboard.
                  </p>
                </div>
                <Field label="Project name">
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Website redesign"
                    required
                  />
                </Field>
                <Field label="Client">
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Acme Studio"
                    required
                  />
                </Field>
                <Field label="Billing type">
                  <SegmentedControl
                    value={billingType}
                    onChange={(id) => setBillingType(id as "hourly" | "fixed")}
                    options={[
                      { id: "hourly", label: "Hourly" },
                      { id: "fixed", label: "Fixed" },
                    ]}
                  />
                </Field>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(0)} disabled={busy}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={busy}>
                    {busy ? "Saving…" : "Start tracking"} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button
                    type="button"
                    className="ml-auto text-sm font-medium text-text-secondary transition hover:text-text disabled:opacity-50"
                    disabled={busy}
                    onClick={() => void finish(false)}
                  >
                    I&apos;ll add a project later
                  </button>
                </div>
              </form>
          </div>
        </div>
      </div>
    </div>
  );
}
