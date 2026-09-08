"use client";

import { Card, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { ProBadge } from "@/components/ui/pro-badge";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { isPaidPlan } from "@/lib/billing";
import { nowIso, uid } from "@/lib/store/helpers";
import { useStore } from "@/lib/store/provider";
import { toast } from "@/components/ui/toast";
import { useState } from "react";

const guides = [
  {
    title: "Start tracking",
    body: "Pick a project on the Dashboard or Time Tracker, describe the task, and hit start. Only one timer runs at a time, so your day never double-counts.",
  },
  {
    title: "Fix or add time",
    body: "Forgot to start the timer? Use Manual entry. Every saved entry can be edited, duplicated, or deleted from the log.",
  },
  {
    title: "Understand earnings",
    body: "Earnings = billable hours × hourly rate. Projects use their own rate and fall back to your default from Settings → Work.",
  },
  {
    title: "Bill your work",
    body: "Create an invoice, import a client's billable hours in one click, then preview and download a PDF.",
  },
];

const shortcuts = [
  { keys: "⌘K / Ctrl+K", action: "Open search" },
  { keys: "Enter", action: "Start timer from the description field" },
  { keys: "Esc", action: "Close a dialog or the search palette" },
];

export default function HelpPage() {
  const { profile, updateProfile } = useStore();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [upgrade, setUpgrade] = useState(false);
  const paid = isPaidPlan(profile?.plan);
  const tickets = profile?.supportTickets ?? [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!paid) {
      setUpgrade(true);
      return;
    }
    await updateProfile({
      supportTickets: [
        { id: uid(), subject: subject.trim(), message: message.trim(), createdAt: nowIso() },
        ...tickets,
      ],
    });
    setSubject("");
    setMessage("");
    toast("Priority request sent. We’ll reply to your account email within one business day.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Support"
        description="Guides for every plan. Priority replies are a Pro feature."
      />

      <Card>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-text">Priority support</h2>
          <ProBadge />
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Pro and Studio members skip the queue. Tell us what’s blocked and we’ll follow up at{" "}
          {profile?.email || "your account email"}.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Subject">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Invoice PDF layout" />
          </Field>
          <Field label="Message">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="What happened, and what did you expect instead?"
            />
          </Field>
          <Button type="submit">{paid ? "Send priority request" : "Unlock with Pro"}</Button>
        </form>
        {tickets.length > 0 ? (
          <ul className="mt-6 divide-y divide-border border-t border-border pt-4">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="py-3 first:pt-0">
                <p className="text-sm font-medium text-text">{ticket.subject}</p>
                <p className="mt-1 text-sm text-text-secondary">{ticket.message}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((g) => (
          <Card key={g.title}>
            <h2 className="text-base font-semibold text-text">{g.title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{g.body}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-base font-semibold text-text">Keyboard shortcuts</h2>
        <ul className="mt-4 divide-y divide-border">
          {shortcuts.map((s) => (
            <li key={s.keys} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <span className="text-sm text-text-secondary">{s.action}</span>
              <kbd className="rounded border border-border bg-muted px-2 py-1 text-xs font-medium text-text">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </Card>

      <UpgradeDialog open={upgrade} onClose={() => setUpgrade(false)} />
    </div>
  );
}
