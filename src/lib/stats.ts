import { format } from "date-fns";
import { billablePercent, hoursFromSeconds } from "@/lib/calculations";
import { DateRange, getWeekDays, getWeekStart, inRange } from "@/lib/dates";
import type { Client, Invoice, Project, TimeEntry } from "@/lib/types";
import { liveDuration } from "@/lib/store/helpers";

export function entriesInRange(entries: TimeEntry[], range: DateRange): TimeEntry[] {
  return entries.filter((e) => inRange(e.startTime, range));
}

export function trackedSeconds(entries: TimeEntry[], at = new Date()): number {
  return entries.reduce((sum, e) => sum + (e.status === "completed" ? e.duration : liveDuration(e, at)), 0);
}

export function billableSeconds(entries: TimeEntry[], at = new Date()): number {
  return entries
    .filter((e) => e.billable)
    .reduce((sum, e) => sum + (e.status === "completed" ? e.duration : liveDuration(e, at)), 0);
}

export function totalEarnings(entries: TimeEntry[]): number {
  return entries.reduce((sum, e) => {
    if (e.status !== "completed") {
      const dur = liveDuration(e);
      return sum + (e.billable ? (dur / 3600) * e.hourlyRate : 0);
    }
    return sum + e.earnings;
  }, 0);
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function timesheetGrid(entries: TimeEntry[], projects: Project[], weekStart: Date) {
  const days = getWeekDays(weekStart);
  const rows = projects
    .map((project) => {
      const hours = days.map((day) => {
        const start = new Date(day);
        start.setHours(0, 0, 0, 0);
        const end = new Date(day);
        end.setHours(23, 59, 59, 999);
        const secs = trackedSeconds(
          entries.filter((e) => e.projectId === project.id && inRange(e.startTime, { start, end })),
        );
        return hoursFromSeconds(secs);
      });
      const total = hours.reduce((a, b) => a + b, 0);
      return { project, hours, total };
    })
    .filter((r) => r.total > 0);
  return { days, rows };
}

export function clientStats(
  client: Client,
  projects: Project[],
  entries: TimeEntry[],
  invoices: Invoice[],
) {
  const cps = projects.filter((p) => p.clientId === client.id);
  const ces = entries.filter((e) => e.clientId === client.id);
  const cis = invoices.filter((i) => i.clientId === client.id);
  const outstanding = cis
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + i.total, 0);
  return {
    activeProjects: cps.filter((p) => p.status === "active").length,
    hours: hoursFromSeconds(trackedSeconds(ces)),
    earnings: totalEarnings(ces),
    outstanding,
    projectCount: cps.length,
  };
}

export function projectStats(project: Project, entries: TimeEntry[]) {
  const pes = entries.filter((e) => e.projectId === project.id);
  const hours = hoursFromSeconds(trackedSeconds(pes));
  const billableH = hoursFromSeconds(billableSeconds(pes));
  return {
    hours,
    billableHours: billableH,
    earnings: totalEarnings(pes),
    remainingBudget: null as number | null,
  };
}

export function reportMetrics(entries: TimeEntry[]) {
  const tracked = hoursFromSeconds(trackedSeconds(entries));
  const billable = hoursFromSeconds(billableSeconds(entries));
  const nonBillable = tracked - billable;
  const earn = totalEarnings(entries);
  const avgRate = billable > 0 ? earn / billable : 0;
  return {
    tracked,
    billable,
    nonBillable,
    billablePct: billablePercent(billable, tracked),
    earnings: earn,
    avgRate,
  };
}

export function earningsByKey(
  entries: TimeEntry[],
  key: "projectId" | "clientId",
  names: Record<string, string>,
) {
  const map = new Map<string, number>();
  for (const e of entries) {
    map.set(e[key], (map.get(e[key]) ?? 0) + (e.status === "completed" ? e.earnings : 0));
  }
  return [...map.entries()]
    .map(([id, value]) => ({ name: names[id] ?? "Unknown", value }))
    .sort((a, b) => b.value - a.value);
}

export function hoursByKey(
  entries: TimeEntry[],
  key: "projectId" | "clientId",
  names: Record<string, string>,
) {
  const map = new Map<string, number>();
  for (const e of entries) {
    map.set(e[key], (map.get(e[key]) ?? 0) + trackedSeconds([e]));
  }
  return [...map.entries()]
    .map(([id, seconds]) => ({ name: names[id] ?? "Unknown", value: hoursFromSeconds(seconds) }))
    .sort((a, b) => b.value - a.value);
}

/** Daily tracked and billable hours across a range, capped so long ranges stay readable. */
export function hoursByDay(entries: TimeEntry[], range: DateRange, maxDays = 31) {
  const days = eachDayInRange(range, maxDays);
  return days.map((day) => {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    const dayEntries = entriesInRange(entries, { start, end });
    const hours = hoursFromSeconds(trackedSeconds(dayEntries));
    const billable = hoursFromSeconds(billableSeconds(dayEntries));
    return {
      name: format(day, days.length > 10 ? "d MMM" : "EEE"),
      hours: Number(hours.toFixed(2)),
      billable: Number(billable.toFixed(2)),
      nonBillable: Number(Math.max(0, hours - billable).toFixed(2)),
    };
  });
}

function eachDayInRange(range: DateRange, maxDays: number): Date[] {
  const days: Date[] = [];
  const cursor = new Date(range.start);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= range.end && days.length < maxDays) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export { getWeekStart };
