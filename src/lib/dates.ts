import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";

export type DatePreset = "today" | "week" | "month" | "lastMonth" | "custom";

export type DateRange = { start: Date; end: Date };

export function getWeekStart(date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function rangeForPreset(preset: DatePreset, custom?: DateRange): DateRange {
  const now = new Date();
  switch (preset) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "lastMonth": {
      const prev = subMonths(now, 1);
      return { start: startOfMonth(prev), end: endOfMonth(prev) };
    }
    case "custom":
      return custom ?? { start: startOfDay(now), end: endOfDay(now) };
  }
}

export function previousRange(range: DateRange): DateRange {
  const ms = range.end.getTime() - range.start.getTime();
  return {
    start: new Date(range.start.getTime() - ms - 1),
    end: new Date(range.start.getTime() - 1),
  };
}

export function inRange(date: Date | string, range: DateRange): boolean {
  const t = new Date(date).getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}

export function formatDay(date: Date): string {
  return format(date, "EEE");
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatShortDate(date: Date | string): string {
  return format(new Date(date), "MMM d");
}

export function toDateInput(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd");
}

export function toTimeInput(date: Date | string): string {
  return format(new Date(date), "HH:mm");
}

export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`);
}

export function daysAgo(n: number): Date {
  return subDays(new Date(), n);
}
