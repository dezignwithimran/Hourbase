import { jsPDF } from "jspdf";
import { formatMoney } from "@/lib/calculations";
import { formatDate } from "@/lib/dates";
import type { Client, Invoice, Profile } from "@/lib/types";

export function downloadInvoicePdf(invoice: Invoice, client: Client | undefined, profile: Profile | null) {
  const doc = new jsPDF();
  const currency = profile?.currency ?? "USD";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("INVOICE", 20, 24);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(profile?.name || "Freelancer", 20, 36);
  if (profile?.company) doc.text(profile.company, 20, 42);
  doc.text(invoice.invoiceNumber, 140, 24);
  doc.text(`Issued ${formatDate(invoice.issueDate)}`, 140, 32);
  doc.text(`Due ${formatDate(invoice.dueDate)}`, 140, 38);
  doc.setFont("helvetica", "bold");
  doc.text("Bill to", 20, 56);
  doc.setFont("helvetica", "normal");
  doc.text(client?.name ?? "Client", 20, 64);
  if (client?.company) doc.text(client.company, 20, 70);
  if (client?.email) doc.text(client.email, 20, 76);

  let y = 92;
  doc.setFont("helvetica", "bold");
  doc.text("Description", 20, y);
  doc.text("Qty", 120, y);
  doc.text("Rate", 145, y);
  doc.text("Amount", 175, y, { align: "right" });
  y += 8;
  doc.setFont("helvetica", "normal");
  for (const item of invoice.items) {
    doc.text(item.description.slice(0, 48), 20, y);
    doc.text(String(item.quantity), 120, y);
    doc.text(formatMoney(item.rate, currency), 145, y);
    doc.text(formatMoney(item.amount, currency), 190, y, { align: "right" });
    y += 8;
    if (y > 260) {
      doc.addPage();
      y = 24;
    }
  }
  y += 8;
  doc.text(`Subtotal ${formatMoney(invoice.subtotal, currency)}`, 190, y, { align: "right" });
  y += 7;
  doc.text(`Discount ${formatMoney(invoice.discount, currency)}`, 190, y, { align: "right" });
  y += 7;
  doc.text(`Tax ${formatMoney(invoice.tax, currency)}`, 190, y, { align: "right" });
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text(`Total ${formatMoney(invoice.total, currency)}`, 190, y, { align: "right" });
  if (invoice.notes) {
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.text(invoice.notes, 20, y, { maxWidth: 170 });
  }
  doc.save(`${invoice.invoiceNumber}.pdf`);
}

export function downloadReportPdf(title: string, lines: string[]) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, 20, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let y = 40;
  for (const line of lines) {
    doc.text(line, 20, y, { maxWidth: 170 });
    y += 8;
    if (y > 270) {
      doc.addPage();
      y = 24;
    }
  }
  doc.save(`${title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
