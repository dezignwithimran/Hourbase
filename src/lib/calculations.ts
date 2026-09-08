export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function durationSeconds(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
}

export function hoursFromSeconds(seconds: number): number {
  return seconds / 3600;
}

export function earningsFromHours(billable: boolean, hours: number, hourlyRate: number): number {
  if (!billable) return 0;
  return roundMoney(hours * hourlyRate);
}

export function earningsFromDuration(
  billable: boolean,
  durationSec: number,
  hourlyRate: number,
): number {
  return earningsFromHours(billable, hoursFromSeconds(durationSec), hourlyRate);
}

export function billablePercent(billableHours: number, totalHours: number): number {
  if (totalHours <= 0) return 0;
  return (billableHours / totalHours) * 100;
}

export function invoiceLineAmount(quantity: number, rate: number): number {
  return roundMoney(quantity * rate);
}

export function invoiceTotal(subtotal: number, discount: number, tax: number): number {
  return roundMoney(subtotal - discount + tax);
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  }
  return `${m}m ${sec.toString().padStart(2, "0")}s`;
}

export function formatHours(seconds: number): string {
  const hours = hoursFromSeconds(seconds);
  if (hours === 0) return "0h";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatMoney(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(currency === "USD" ? "en-US" : undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
