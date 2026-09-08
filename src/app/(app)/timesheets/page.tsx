"use client";

import { Button } from "@/components/ui/button";
import { PageHeader, TableShell } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { StatTile } from "@/components/ui/kpi";
import { downloadCsv } from "@/lib/csv";
import { formatHours, formatMoney } from "@/lib/calculations";
import { getWeekStart } from "@/lib/dates";
import { billableSeconds, timesheetGrid, totalEarnings, trackedSeconds } from "@/lib/stats";
import { useStore } from "@/lib/store/provider";
import { addWeeks, format, isSameWeek } from "date-fns";
import { CalendarRange, ChevronLeft, ChevronRight, Download } from "@/components/ui/icons";
import { useMemo, useState } from "react";

export default function TimesheetsPage() {
  const { projects, timeEntries, profile } = useStore();
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const grid = useMemo(
    () => timesheetGrid(timeEntries, projects, weekStart),
    [timeEntries, projects, weekStart],
  );

  const weekEntries = timeEntries.filter((e) => {
    const t = new Date(e.startTime).getTime();
    return t >= weekStart.getTime() && t <= addWeeks(weekStart, 1).getTime() - 1;
  });
  const tracked = trackedSeconds(weekEntries);
  const billable = billableSeconds(weekEntries);
  const earnings = totalEarnings(weekEntries);
  const isCurrentWeek = isSameWeek(weekStart, new Date(), { weekStartsOn: 1 });
  const dayTotals = grid.days.map((_, i) => grid.rows.reduce((sum, r) => sum + r.hours[i], 0));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timesheets"
        description="A weekly view of every project you worked on."
        actions={
          <>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5 shadow-xs">
              <button
                type="button"
                aria-label="Previous week"
                className="rounded-[7px] p-1.5 text-text-secondary transition hover:bg-muted hover:text-text"
                onClick={() => setWeekStart(addWeeks(weekStart, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[9.5rem] px-2 text-center text-[13px] font-medium text-text">
                {isCurrentWeek ? "This week" : format(weekStart, "MMM d, yyyy")}
              </span>
              <button
                type="button"
                aria-label="Next week"
                className="rounded-[7px] p-1.5 text-text-secondary transition hover:bg-muted hover:text-text"
                onClick={() => setWeekStart(addWeeks(weekStart, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                downloadCsv(`timesheet-${format(weekStart, "yyyy-MM-dd")}.csv`, [
                  ["Project", ...grid.days.map((d) => format(d, "EEE MMM d")), "Total"],
                  ...grid.rows.map((r) => [
                    r.project.name,
                    ...r.hours.map((h) => h.toFixed(2)),
                    r.total.toFixed(2),
                  ]),
                ]);
              }}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </>
        }
      />

      {grid.rows.length === 0 ? (
        <EmptyState
          icon={<CalendarRange />}
          title="No hours this week"
          description="Track time against a project and it will appear in this grid automatically."
        />
      ) : (
        <TableShell>
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Project</th>
                {grid.days.map((d) => (
                  <th
                    key={d.toISOString()}
                    className="px-3 py-3 text-center text-xs font-semibold text-text-secondary"
                  >
                    <span className="block">{format(d, "EEE")}</span>
                    <span className="block text-[11px] font-normal text-text-tertiary">
                      {format(d, "d MMM")}
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {grid.rows.map((row) => (
                <tr
                  key={row.project.id}
                  className="border-b border-border transition-colors hover:bg-surface-2"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: row.project.color }}
                      />
                      <span className="font-medium text-text">{row.project.name}</span>
                    </div>
                  </td>
                  {row.hours.map((h, i) => (
                    <td
                      key={i}
                      className={`num px-3 py-3.5 text-center ${
                        h ? "font-medium text-text" : "text-text-tertiary"
                      }`}
                    >
                      {h ? `${h.toFixed(1)}h` : "—"}
                    </td>
                  ))}
                  <td className="num px-5 py-3.5 text-right font-semibold text-text">
                    {row.total.toFixed(1)}h
                  </td>
                </tr>
              ))}
              <tr className="bg-surface-2">
                <td className="px-5 py-3.5 text-xs font-semibold text-text-secondary">
                  Daily total
                </td>
                {dayTotals.map((t, i) => (
                  <td key={i} className="num px-3 py-3.5 text-center text-sm font-semibold text-text">
                    {t ? `${t.toFixed(1)}h` : "—"}
                  </td>
                ))}
                <td className="num px-5 py-3.5 text-right text-sm font-semibold text-primary">
                  {(tracked / 3600).toFixed(1)}h
                </td>
              </tr>
            </tbody>
          </table>
        </TableShell>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total tracked" value={formatHours(tracked)} />
        <StatTile label="Billable" value={formatHours(billable)} tone="success" />
        <StatTile label="Non-billable" value={formatHours(tracked - billable)} tone="muted" />
        <StatTile label="Earnings" value={formatMoney(earnings, profile?.currency)} />
      </div>
    </div>
  );
}
