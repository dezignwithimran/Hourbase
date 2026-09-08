"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, PageHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea, TimezoneSelect } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { applyAppearance, isDarkAppearance } from "@/lib/appearance";
import { formatRenewsAt, getPlan, isPaidPlan, planPriceLabel, usage } from "@/lib/billing";
import { CURRENCIES } from "@/lib/timezones";
import { useStore } from "@/lib/store/provider";
import { Appearance } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { Monitor, Moon, Sun } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

const themes: {
  id: Appearance;
  label: string;
  description: string;
  icon: typeof Sun;
}[] = [
  { id: "light", label: "Light", description: "Always use a light workspace.", icon: Sun },
  { id: "dark", label: "Dark", description: "Always use a dark workspace.", icon: Moon },
  {
    id: "system",
    label: "System",
    description: "Follow this device’s Light or Dark setting.",
    icon: Monitor,
  },
];

export default function SettingsPage() {
  const { profile, projects, clients, invoices, updateProfile, changePassword, deleteAccount, logout } =
    useStore();
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile, rates, and preferences.">
        <Tabs
          tabs={[
            { id: "profile", label: "Profile" },
            { id: "work", label: "Work" },
            { id: "notifications", label: "Notifications" },
            { id: "appearance", label: "Appearance" },
            { id: "plan", label: "Plan" },
            { id: "account", label: "Account" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </PageHeader>

      {tab === "profile" && (
        <Card className="max-w-2xl">
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <Avatar name={profile.name} src={profile.avatar || undefined} size="lg" />
            <div>
              <p className="font-semibold text-text">{profile.name}</p>
              <p className="text-sm text-text-secondary">{profile.email}</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <Field label="Name">
              <Input
                defaultValue={profile.name}
                onBlur={(e) => updateProfile({ name: e.target.value })}
              />
            </Field>
            <Field label="Email" hint="Your login email cannot be changed here.">
              <Input defaultValue={profile.email} disabled />
            </Field>
            <Field label="Avatar URL">
              <Input
                defaultValue={profile.avatar}
                onBlur={(e) => updateProfile({ avatar: e.target.value })}
                placeholder="https://…"
              />
            </Field>
            <Field label="Company">
              <Input
                defaultValue={profile.company}
                onBlur={(e) => updateProfile({ company: e.target.value })}
              />
            </Field>
            <Field label="Bio">
              <Textarea
                defaultValue={profile.bio}
                onBlur={(e) => updateProfile({ bio: e.target.value })}
              />
            </Field>
            <p className="text-xs text-text-secondary">Changes save when you leave a field.</p>
          </div>
        </Card>
      )}

      {tab === "work" && (
        <Card className="max-w-2xl space-y-4">
          <CardHeader
            title="Billing defaults"
            description="Applied to new projects and manual entries."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default hourly rate">
              <Input
                type="number"
                defaultValue={profile.defaultHourlyRate}
                onBlur={(e) => updateProfile({ defaultHourlyRate: Number(e.target.value) })}
              />
            </Field>
            <Field label="Currency">
              <Select
                defaultValue={profile.currency}
                onChange={(e) => updateProfile({ currency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Timezone">
              <TimezoneSelect
                value={profile.timezone}
                onChange={(tz) => updateProfile({ timezone: tz })}
              />
            </Field>
            <Field label="Working hours per day">
              <Input
                type="number"
                defaultValue={profile.workingHoursPerDay}
                onBlur={(e) => updateProfile({ workingHoursPerDay: Number(e.target.value) })}
              />
            </Field>
          </div>
        </Card>
      )}

      {tab === "notifications" && (
        <Card className="max-w-2xl">
          <CardHeader
            title="Notifications"
            description="Choose what the app should nudge you about."
          />
          <div className="mt-5 divide-y divide-border">
            <div className="py-4 first:pt-0">
              <Toggle
                checked={profile.notifyTimerReminders}
                onChange={(v) => updateProfile({ notifyTimerReminders: v })}
                label="Timer reminders"
                description="Ping me if a timer has been running unusually long."
              />
            </div>
            <div className="py-4">
              <Toggle
                checked={profile.notifyWeeklySummary}
                onChange={(v) => updateProfile({ notifyWeeklySummary: v })}
                label="Weekly summary"
                description="A Monday recap of hours tracked and earned."
              />
            </div>
            <div className="py-4 last:pb-0">
              <Toggle
                checked={profile.notifyInvoiceReminders}
                onChange={(v) => updateProfile({ notifyInvoiceReminders: v })}
                label="Invoice reminders"
                description="Remind me when an invoice passes its due date."
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-text-secondary">
            Preferences are stored now. Email delivery is planned for a later release.
          </p>
        </Card>
      )}

      {tab === "appearance" && (
        <Card className="max-w-2xl">
          <CardHeader
            title="Color mode"
            description="Choose a fixed theme, or follow your operating system."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const active = profile.appearance === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    updateProfile({ appearance: t.id });
                    applyAppearance(t.id);
                  }}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-card border p-4 text-left transition",
                    active
                      ? "border-primary bg-primary-soft ring-2 ring-primary/15"
                      : "border-border bg-surface hover:border-border-strong",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-text-secondary")} />
                  <span>
                    <span
                      className={cn(
                        "block text-sm font-semibold",
                        active ? "text-primary" : "text-text",
                      )}
                    >
                      {t.label}
                    </span>
                    <span className="mt-1 block text-xs text-text-secondary">{t.description}</span>
                    {t.id === "system" && active ? (
                      <span className="mt-2 block text-xs font-medium text-text">
                        Using {isDarkAppearance("system") ? "dark" : "light"} right now
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {tab === "plan" && (
        <Card className="max-w-2xl">
          <CardHeader
            title={`${getPlan(profile.plan).name} plan`}
            description={
              isPaidPlan(profile.plan)
                ? `${planPriceLabel(getPlan(profile.plan), profile.planInterval)}${
                    formatRenewsAt(profile.planRenewsAt)
                      ? ` · renews ${formatRenewsAt(profile.planRenewsAt)}`
                      : ""
                  }`
                : "3 projects, 3 clients, and 5 invoices. Time tracking is unlimited."
            }
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <UsageStat label="Projects" text={usage("projects", projects.length, profile.plan).label} />
            <UsageStat label="Clients" text={usage("clients", clients.length, profile.plan).label} />
            <UsageStat label="Invoices" text={usage("invoices", invoices.length, profile.plan).label} />
          </div>
          <Button className="mt-5" onClick={() => router.push("/billing")}>
            {isPaidPlan(profile.plan) ? "Manage plan" : "Upgrade plan"}
          </Button>
        </Card>
      )}

      {tab === "account" && (
        <div className="max-w-2xl space-y-4">
          <Card>
            <CardHeader title="Password" description="Use at least 8 characters." />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Current password">
                <Input
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
              </Field>
              <Field label="New password">
                <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
              </Field>
            </div>
            <Button
              className="mt-4"
              onClick={async () => {
                try {
                  await changePassword(current, next);
                  toast("Password updated");
                  setCurrent("");
                  setNext("");
                } catch (e) {
                  toast(e instanceof Error ? e.message : "Could not change password", "error");
                }
              }}
            >
              Change password
            </Button>
          </Card>

          <Card>
            <CardHeader title="Session" description="Sign out of this browser." />
            <Button
              variant="outline"
              className="mt-4"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              Log out
            </Button>
          </Card>

          <Card className="border-danger/25">
            <CardHeader
              title="Danger zone"
              description="Deleting your account removes all tracked time, clients, and invoices."
            />
            <Button variant="danger" className="mt-4" onClick={() => setConfirmDelete(true)}>
              Delete account
            </Button>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        description="All time, clients, projects, and invoices for this user will be removed."
        confirmLabel="Delete account"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteAccount();
          router.replace("/signup");
        }}
      />
    </div>
  );
}

function UsageStat({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-card border border-border bg-surface-2 px-3 py-3">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-text-tertiary uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-text">{text}</p>
    </div>
  );
}
