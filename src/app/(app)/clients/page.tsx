"use client";

import { UpgradeDialog } from "@/components/upgrade-dialog";
import { Button } from "@/components/ui/button";
import { PageHeader, TableShell } from "@/components/ui/card";
import { ConfirmDialog, EmptyState, Modal } from "@/components/ui/feedback";
import { Field, Input, SearchInput, Textarea } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { formatHours, formatMoney } from "@/lib/calculations";
import { canCreate, PlanLimitError } from "@/lib/billing";
import type { PlanFeature } from "@/lib/billing";
import { clientStats } from "@/lib/stats";
import { useStore } from "@/lib/store/provider";
import { Client } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { Plus, Trash2, Users } from "@/components/ui/icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ClientsPage() {
  const { clients, projects, timeEntries, invoices, createClient, deleteClient, activeTimer, profile } =
    useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [upgrade, setUpgrade] = useState<PlanFeature | null>(null);
  const [pending, setPending] = useState<Client | null>(null);

  function openCreate() {
    if (!canCreate("clients", clients.length, profile?.plan)) {
      setUpgrade("clients");
      return;
    }
    setOpen(true);
  }

  const list = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.company.toLowerCase().includes(q.toLowerCase()),
      ),
    [clients, q],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Track hours, earnings, and outstanding invoices per client."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create client
          </Button>
        }
      >
        <SearchInput
          placeholder="Search clients"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:max-w-xs"
        />
      </PageHeader>

      {list.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={q ? "No matching clients" : "No clients yet"}
          description="Add a client so projects, time, and invoices all roll up in one place."
          action={{ label: "Create client", onClick: openCreate }}
        />
      ) : (
        <TableShell>
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Client</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Email</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Active projects
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Hours
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Earnings
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Outstanding
                </th>
                <th className="sticky right-0 z-10 bg-surface-2 px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const s = clientStats(c, projects, timeEntries, invoices);
                return (
                  <tr
                    key={c.id}
                    className="group border-b border-border transition-colors last:border-0 hover:bg-surface-2"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} size="sm" />
                        <div className="min-w-0">
                          <Link
                            href={`/clients/${c.id}`}
                            className="block truncate font-medium text-text hover:text-primary"
                          >
                            {c.name}
                          </Link>
                          {c.company ? (
                            <span className="block truncate text-xs text-text-secondary">
                              {c.company}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">{c.email || "—"}</td>
                    <td className="num px-5 py-3.5 text-right text-text">{s.activeProjects}</td>
                    <td className="num px-5 py-3.5 text-right text-text">
                      {formatHours(s.hours * 3600)}
                    </td>
                    <td className="num px-5 py-3.5 text-right font-semibold text-text">
                      {formatMoney(s.earnings, profile?.currency)}
                    </td>
                    <td className="num px-5 py-3.5 text-right text-text-secondary">
                      {formatMoney(s.outstanding, profile?.currency)}
                    </td>
                    <td className="sticky right-0 z-10 bg-surface px-5 py-3.5 shadow-[-12px_0_12px_-12px_rgb(15_23_42/0.18)] group-hover:bg-surface-2">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          aria-label={`Delete ${c.name}`}
                          className="rounded-md p-1.5 text-text-secondary transition hover:bg-danger-soft hover:text-danger"
                          onClick={() => setPending(c)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableShell>
      )}

      <ClientForm
        open={open}
        onClose={() => setOpen(false)}
        onCreate={async (input) => {
          try {
            await createClient(input);
            toast("Client created");
            setOpen(false);
          } catch (e) {
            if (e instanceof PlanLimitError) {
              setOpen(false);
              setUpgrade(e.feature);
              return;
            }
            toast(e instanceof Error ? e.message : "Could not create client", "error");
          }
        }}
      />
      <UpgradeDialog
        open={Boolean(upgrade)}
        feature={upgrade ?? undefined}
        onClose={() => setUpgrade(null)}
      />
      <ConfirmDialog
        open={Boolean(pending)}
        title={pending ? `Delete ${pending.name}?` : "Delete this client?"}
        description={
          pending && projects.some((p) => p.clientId === pending.id && p.id === activeTimer?.projectId)
            ? "A timer is running on a project for this client and will be stopped. This permanently removes the client, their projects, time entries, and invoices."
            : "This permanently removes the client, their projects, time entries, and invoices."
        }
        confirmLabel="Delete client"
        danger
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return;
          const id = pending.id;
          setPending(null);
          await deleteClient(id);
          toast("Client deleted");
        }}
      />
    </div>
  );
}

function ClientForm({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: Omit<Client, "id" | "userId" | "createdAt">) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setNotes("");
  }, [open]);

  return (
    <Modal
      open={open}
      title="Create client"
      description="Clients group projects, time, and invoices together."
      onClose={onClose}
    >
      <div className="space-y-4">
        <Field label="Client name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mr David"
            required
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="david@studio.com"
          />
        </Field>
        <Field label="Company">
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Studio" />
        </Field>
        <Field label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 202 555 0147" />
        </Field>
        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name}
            onClick={() => onCreate({ name, company, email, phone, notes })}
          >
            Create client
          </Button>
        </div>
      </div>
    </Modal>
  );
}
