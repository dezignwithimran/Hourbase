"use client";

import { EntriesTable } from "@/components/entries-table";
import { InvoiceBadge, ProjectBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi";
import { Tabs } from "@/components/ui/tabs";
import { formatHours, formatMoney } from "@/lib/calculations";
import { formatDate } from "@/lib/dates";
import { clientStats } from "@/lib/stats";
import { useStore } from "@/lib/store/provider";
import { ArrowLeft, Clock, DollarSign, FileText, FolderKanban } from "@/components/ui/icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { clients, projects, timeEntries, invoices, updateClient, profile } = useStore();
  const client = clients.find((c) => c.id === id);
  const [tab, setTab] = useState("overview");

  if (!client) {
    return (
      <Card className="text-center">
        <p className="text-sm text-text-secondary">This client no longer exists.</p>
        <Link href="/clients" className="mt-3 inline-block text-sm font-medium text-primary">
          Back to clients
        </Link>
      </Card>
    );
  }

  const stats = clientStats(client, projects, timeEntries, invoices);
  const cps = projects.filter((p) => p.clientId === client.id);
  const ces = timeEntries.filter((e) => e.clientId === client.id && e.status === "completed");
  const cis = invoices.filter((i) => i.clientId === client.id);

  return (
    <div className="space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" /> Clients
      </Link>

      <div className="flex items-center gap-4 border-b border-border pb-5">
        <Avatar name={client.name} size="lg" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">{client.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {[client.company, client.email].filter(Boolean).join(" · ") || "No contact details yet"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Projects" value={String(stats.projectCount)} icon={<FolderKanban />} />
        <KpiCard
          label="Tracked hours"
          value={formatHours(stats.hours * 3600)}
          icon={<Clock />}
          accent="neutral"
        />
        <KpiCard
          label="Total earnings"
          value={formatMoney(stats.earnings, profile?.currency)}
          icon={<DollarSign />}
          accent="success"
        />
        <KpiCard
          label="Outstanding"
          value={formatMoney(stats.outstanding, profile?.currency)}
          icon={<FileText />}
          accent="warning"
        />
      </div>

      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "projects", label: `Projects (${cps.length})` },
          { id: "time", label: "Time" },
          { id: "invoices", label: `Invoices (${cis.length})` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <Card className="max-w-xl space-y-4">
          <Field label="Client name">
            <Input
              defaultValue={client.name}
              onBlur={(e) => updateClient(client.id, { name: e.target.value })}
            />
          </Field>
          <Field label="Company">
            <Input
              defaultValue={client.company}
              onBlur={(e) => updateClient(client.id, { company: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <Input
                defaultValue={client.email}
                onBlur={(e) => updateClient(client.id, { email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <Input
                defaultValue={client.phone}
                onBlur={(e) => updateClient(client.id, { phone: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea
              defaultValue={client.notes}
              onBlur={(e) => updateClient(client.id, { notes: e.target.value })}
            />
          </Field>
          <p className="text-xs text-text-secondary">Changes save when you leave a field.</p>
        </Card>
      )}

      {tab === "projects" &&
        (cps.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {cps.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3.5 shadow-card transition hover:border-border-strong hover:shadow-raised"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: p.color }}
                    />
                    <span className="truncate font-medium text-text">{p.name}</span>
                  </span>
                  <ProjectBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No projects" description="Create a project for this client to start tracking." />
        ))}

      {tab === "time" && <EntriesTable entries={ces} />}

      {tab === "invoices" &&
        (cis.length ? (
          <ul className="space-y-2">
            {cis.map((inv) => (
              <li key={inv.id}>
                <Link
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3.5 shadow-card transition hover:border-border-strong"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-text">{inv.invoiceNumber}</span>
                    <span className="block text-xs text-text-secondary">
                      Due {formatDate(inv.dueDate)}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="num font-semibold text-text">
                      {formatMoney(inv.total, profile?.currency)}
                    </span>
                    <InvoiceBadge status={inv.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<FileText />}
            title="No invoices"
            description="Billable time for this client can be turned into an invoice."
          />
        ))}
    </div>
  );
}
