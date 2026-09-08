"use client";

import { Button } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import {
  formatMoney,
  hoursFromSeconds,
  invoiceLineAmount,
  invoiceTotal,
} from "@/lib/calculations";
import { toDateInput } from "@/lib/dates";
import { totalEarnings, trackedSeconds } from "@/lib/stats";
import { nextInvoiceNumber } from "@/lib/store/helpers";
import { useStore } from "@/lib/store/provider";
import { PlanLimitError } from "@/lib/billing";
import { toast } from "@/components/ui/toast";
import { addDays } from "date-fns";
import { ArrowLeft, Plus, Sparkles, Trash2 } from "@/components/ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function NewInvoicePage() {
  const { clients, timeEntries, invoices, createInvoice, profile } = useStore();
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber(invoices));
  const [issueDate, setIssueDate] = useState(toDateInput(new Date()));
  const [dueDate, setDueDate] = useState(toDateInput(addDays(new Date(), 14)));
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { description: "Professional services", quantity: 1, rate: profile?.defaultHourlyRate ?? 0 },
  ]);

  const unbilled = useMemo(() => {
    const entries = timeEntries.filter(
      (e) => e.clientId === clientId && e.billable && e.status === "completed",
    );
    return {
      hours: hoursFromSeconds(trackedSeconds(entries)),
      earnings: totalEarnings(entries),
    };
  }, [timeEntries, clientId]);

  const lines = items.map((i) => ({ ...i, amount: invoiceLineAmount(i.quantity, i.rate) }));
  const subtotal = lines.reduce((s, i) => s + i.amount, 0);
  const total = invoiceTotal(subtotal, Number(discount) || 0, Number(tax) || 0);
  const currency = profile?.currency;

  function importHours() {
    if (unbilled.hours <= 0) {
      toast("No billable hours found for this client", "warning");
      return;
    }
    setItems([
      {
        description: "Billable hours",
        quantity: Number(unbilled.hours.toFixed(2)),
        rate:
          unbilled.hours > 0
            ? Number((unbilled.earnings / unbilled.hours).toFixed(2))
            : (profile?.defaultHourlyRate ?? 0),
      },
    ]);
    toast("Billable hours imported");
  }

  async function save() {
    try {
      const inv = await createInvoice({
        clientId,
        invoiceNumber,
        issueDate,
        dueDate,
        items: lines,
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        notes,
      });
      toast("Draft invoice saved");
      router.push(`/invoices/${inv.id}`);
    } catch (e) {
      if (e instanceof PlanLimitError) {
        toast(e.message, "warning");
        router.push("/billing");
        return;
      }
      toast(e instanceof Error ? e.message : "Could not save", "error");
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" /> Invoices
      </Link>

      <PageHeader
        title="Create invoice"
        description="Import billable hours or add line items manually."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Client">
                <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Invoice number">
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="num"
                />
              </Field>
              <Field label="Issue date">
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </Field>
              <Field label="Due date">
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-text">Line items</h2>
              <Button variant="outline" size="sm" onClick={importHours} disabled={!clientId}>
                <Sparkles className="h-3.5 w-3.5" />
                Import {unbilled.hours.toFixed(1)}h billable
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="hidden gap-2 px-1 text-xs font-semibold text-text-secondary sm:grid sm:grid-cols-[minmax(0,1fr)_88px_110px_110px_36px]">
                <span>Description</span>
                <span>Qty</span>
                <span>Rate</span>
                <span className="text-right">Amount</span>
                <span />
              </div>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_88px_110px_110px_36px] sm:items-center"
                >
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      setItems(
                        items.map((it, i) =>
                          i === idx ? { ...it, description: e.target.value } : it,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      setItems(
                        items.map((it, i) =>
                          i === idx ? { ...it, quantity: Number(e.target.value) } : it,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) =>
                      setItems(
                        items.map((it, i) =>
                          i === idx ? { ...it, rate: Number(e.target.value) } : it,
                        ),
                      )
                    }
                  />
                  <span className="num px-1 text-right text-sm font-semibold text-text">
                    {formatMoney(invoiceLineAmount(item.quantity, item.rate), currency)}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove line"
                    className="justify-self-end rounded-md p-2 text-text-secondary transition hover:bg-danger-soft hover:text-danger"
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setItems([...items, { description: "", quantity: 1, rate: 0 }])}
            >
              <Plus className="h-4 w-4" /> Add line
            </Button>
          </Card>

          <Card>
            <Field label="Notes">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, bank details, or a thank you."
              />
            </Field>
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <h2 className="text-base font-semibold text-text">Summary</h2>
            <div className="mt-4 space-y-3">
              <Field label="Discount">
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </Field>
              <Field label="Tax">
                <Input type="number" value={tax} onChange={(e) => setTax(e.target.value)} />
              </Field>
            </div>
            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={formatMoney(subtotal, currency)} />
              <Row label="Discount" value={`− ${formatMoney(Number(discount) || 0, currency)}`} />
              <Row label="Tax" value={`+ ${formatMoney(Number(tax) || 0, currency)}`} />
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm font-semibold text-text">Total</span>
              <span className="num text-xl font-semibold text-text">
                {formatMoney(total, currency)}
              </span>
            </div>
            <Button className="mt-5 w-full" size="lg" onClick={save} disabled={!clientId}>
              Save draft
            </Button>
          </Card>
        </div>
      </div>
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
