"use client";

import { UpgradeDialog } from "@/components/upgrade-dialog";
import { InvoiceBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, TableShell } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { StatTile } from "@/components/ui/kpi";
import { formatMoney } from "@/lib/calculations";
import { formatDate } from "@/lib/dates";
import { useStore } from "@/lib/store/provider";
import { canCreate } from "@/lib/billing";
import { FileText, Plus } from "@/components/ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InvoicesPage() {
  const { invoices, clients, profile } = useStore();
  const router = useRouter();
  const [upgrade, setUpgrade] = useState(false);

  function openCreate() {
    if (!canCreate("invoices", invoices.length, profile?.plan)) {
      setUpgrade(true);
      return;
    }
    router.push("/invoices/new");
  }
  const currency = profile?.currency;

  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + i.total, 0);
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const drafts = invoices.filter((i) => i.status === "draft").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Turn tracked work into professional invoices."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create invoice
          </Button>
        }
      />

      {invoices.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No invoices yet"
          description="Pull billable hours into an invoice, preview it, and download a PDF in seconds."
          action={{ label: "Create invoice", onClick: openCreate }}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile label="Outstanding" value={formatMoney(outstanding, currency)} />
            <StatTile label="Paid" value={formatMoney(paid, currency)} tone="success" />
            <StatTile label="Drafts" value={String(drafts)} tone="muted" />
          </div>

          <TableShell>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Invoice</th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Client</th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Issued</th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Due</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const client = clients.find((c) => c.id === inv.clientId);
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-border transition-colors last:border-0 hover:bg-surface-2"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="num font-semibold text-text hover:text-primary"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{client?.name ?? "—"}</td>
                      <td className="px-5 py-3.5 text-text-secondary">
                        {formatDate(inv.issueDate)}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{formatDate(inv.dueDate)}</td>
                      <td className="num px-5 py-3.5 text-right font-semibold text-text">
                        {formatMoney(inv.total, currency)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <InvoiceBadge status={inv.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableShell>
        </>
      )}
      <UpgradeDialog open={upgrade} feature="invoices" onClose={() => setUpgrade(false)} />
    </div>
  );
}
