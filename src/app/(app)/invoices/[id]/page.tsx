"use client";

import { InvoiceBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/feedback";
import { Select } from "@/components/ui/input";
import { formatMoney } from "@/lib/calculations";
import { formatDate } from "@/lib/dates";
import { downloadInvoicePdf } from "@/lib/pdf";
import { useStore } from "@/lib/store/provider";
import { InvoiceStatus } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, Download, Eye, EyeOff, Trash2 } from "@/components/ui/icons";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { invoices, clients, profile, setInvoiceStatus, deleteInvoice } = useStore();
  const invoice = invoices.find((i) => i.id === id);
  const client = clients.find((c) => c.id === invoice?.clientId);
  const [confirm, setConfirm] = useState(false);
  const [preview, setPreview] = useState(false);

  if (!invoice) {
    return (
      <Card className="text-center">
        <p className="text-sm text-text-secondary">This invoice no longer exists.</p>
        <Link href="/invoices" className="mt-3 inline-block text-sm font-medium text-primary">
          Back to invoices
        </Link>
      </Card>
    );
  }

  const currency = profile?.currency;

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" /> Invoices
      </Link>

      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="num text-2xl font-semibold tracking-tight text-text">
              {invoice.invoiceNumber}
            </h1>
            <InvoiceBadge status={invoice.status} />
          </div>
          <p className="mt-1.5 text-sm text-text-secondary">
            {client?.name} · issued {formatDate(invoice.issueDate)} · due{" "}
            {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={invoice.status}
            onChange={(e) => setInvoiceStatus(invoice.id, e.target.value as InvoiceStatus)}
            className="w-36"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Button variant="outline" onClick={() => setPreview((v) => !v)}>
            {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {preview ? "Hide preview" : "Preview"}
          </Button>
          <Button
            onClick={() => {
              downloadInvoicePdf(invoice, client, profile);
              toast("PDF downloaded");
            }}
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="outline" onClick={() => setConfirm(true)} aria-label="Delete invoice">
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card padded={false}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Description</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Qty
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Rate
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 font-medium text-text">{item.description}</td>
                  <td className="num px-5 py-3.5 text-right text-text-secondary">
                    {item.quantity}
                  </td>
                  <td className="num px-5 py-3.5 text-right text-text-secondary">
                    {formatMoney(item.rate, currency)}
                  </td>
                  <td className="num px-5 py-3.5 text-right font-semibold text-text">
                    {formatMoney(item.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="xl:sticky xl:top-24 xl:self-start">
          <h2 className="text-base font-semibold text-text">Totals</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatMoney(invoice.subtotal, currency)} />
            <Row label="Discount" value={`− ${formatMoney(invoice.discount, currency)}`} />
            <Row label="Tax" value={`+ ${formatMoney(invoice.tax, currency)}`} />
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold text-text">Total due</span>
            <span className="num text-2xl font-semibold text-text">
              {formatMoney(invoice.total, currency)}
            </span>
          </div>
          {invoice.notes ? (
            <p className="mt-4 border-t border-border pt-4 text-sm text-text-secondary">
              {invoice.notes}
            </p>
          ) : null}
        </Card>
      </div>

      {preview && (
        <div className="animate-slide-up rounded-panel border border-border bg-white p-10 text-slate-900 shadow-raised">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                Invoice
              </p>
              <p className="num mt-1 text-3xl font-semibold">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p className="font-semibold text-slate-900">{profile?.name}</p>
              {profile?.company ? <p>{profile.company}</p> : null}
              <p>{profile?.email}</p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Bill to
              </p>
              <p className="mt-2 font-semibold text-slate-900">{client?.name}</p>
              {client?.company ? <p className="text-slate-500">{client.company}</p> : null}
              {client?.email ? <p className="text-slate-500">{client.email}</p> : null}
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Dates</p>
              <p className="mt-2 text-slate-500">Issued {formatDate(invoice.issueDate)}</p>
              <p className="text-slate-500">Due {formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          <table className="mt-10 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase">
                <th className="pb-2 font-semibold">Description</th>
                <th className="pb-2 text-right font-semibold">Qty</th>
                <th className="pb-2 text-right font-semibold">Rate</th>
                <th className="pb-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3">{item.description}</td>
                  <td className="num py-3 text-right">{item.quantity}</td>
                  <td className="num py-3 text-right">{formatMoney(item.rate, currency)}</td>
                  <td className="num py-3 text-right">{formatMoney(item.amount, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-56 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="num">{formatMoney(invoice.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Discount</span>
                <span className="num">− {formatMoney(invoice.discount, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span className="num">+ {formatMoney(invoice.tax, currency)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span className="num">{formatMoney(invoice.total, currency)}</span>
              </div>
            </div>
          </div>

          {invoice.notes ? (
            <p className="mt-10 border-t border-slate-100 pt-4 text-sm text-slate-500">
              {invoice.notes}
            </p>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        title="Delete invoice?"
        description="This permanently removes the invoice and its line items."
        confirmLabel="Delete invoice"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          await deleteInvoice(invoice.id);
          toast("Invoice deleted");
          router.push("/invoices");
        }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="num font-medium text-text">{value}</dd>
    </div>
  );
}
