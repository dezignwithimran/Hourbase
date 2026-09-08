"use client";

import { DateFilter } from "@/components/date-filter";
import { EntriesTable } from "@/components/entries-table";
import { TimerPanel } from "@/components/timer/timer-panel";
import { Card, PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { KpiCard } from "@/components/ui/kpi";
import { SegmentedControl } from "@/components/ui/tabs";
import { formatHours, formatMoney } from "@/lib/calculations";
import {
  DatePreset,
  DateRange,
  formatDay,
  getWeekDays,
  getWeekStart,
  rangeForPreset,
} from "@/lib/dates";
import {
  billableSeconds,
  entriesInRange,
  percentChange,
  totalEarnings,
  trackedSeconds,
} from "@/lib/stats";
import { useStore } from "@/lib/store/provider";
import { Clock, DollarSign, FolderKanban, Zap } from "@/components/ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const { timeEntries, projects, profile } = useStore();
  const router = useRouter();
  const [preset, setPreset] = useState<DatePreset>("week");
  const [custom, setCustom] = useState<DateRange>(rangeForPreset("week"));
  const [mode, setMode] = useState("hours");
  const range = preset === "custom" ? custom : rangeForPreset(preset, custom);
  const prior = useMemo(() => {
    const ms = range.end.getTime() - range.start.getTime();
    return {
      start: new Date(range.start.getTime() - ms - 1),
      end: new Date(range.start.getTime() - 1),
    };
  }, [range]);

  const current = entriesInRange(timeEntries, range);
  const previous = entriesInRange(timeEntries, prior);
  const tracked = trackedSeconds(current);
  const billable = billableSeconds(current);
  const earnings = totalEarnings(current);
  const active = projects.filter((p) => p.status === "active").length;
  const currency = profile?.currency ?? "USD";
  const completed = timeEntries.filter((e) => e.status === "completed");

  const weekStart = getWeekStart();
  const chart = getWeekDays(weekStart).map((day) => {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    const dayEntries = entriesInRange(timeEntries, { start, end });
    return {
      name: formatDay(day),
      hours: Number((trackedSeconds(dayEntries) / 3600).toFixed(2)),
      earnings: Number(totalEarnings(dayEntries).toFixed(2)),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your tracked work, billable split, and earnings at a glance."
        actions={
          <DateFilter preset={preset} onPreset={setPreset} custom={custom} onCustom={setCustom} />
        }
      />

      <TimerPanel />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Tracked time"
          value={formatHours(tracked)}
          hint="this period"
          change={percentChange(tracked, trackedSeconds(previous))}
          icon={<Clock />}
        />
        <KpiCard
          label="Billable time"
          value={formatHours(billable)}
          hint={`${tracked ? Math.round((billable / tracked) * 100) : 0}% of tracked`}
          change={percentChange(billable, billableSeconds(previous))}
          icon={<Zap />}
          accent="warning"
        />
        <KpiCard
          label="Earnings"
          value={formatMoney(earnings, currency)}
          hint="billable work"
          change={percentChange(earnings, totalEarnings(previous))}
          icon={<DollarSign />}
          accent="success"
        />
        <KpiCard
          label="Active projects"
          value={String(active)}
          hint="currently not archived"
          icon={<FolderKanban />}
          accent="neutral"
        />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text">Weekly activity</h2>
            <p className="mt-0.5 text-sm text-text-secondary">Monday to Sunday, this week</p>
          </div>
          <SegmentedControl
            options={[
              { id: "hours", label: "Hours" },
              { id: "earnings", label: "Earnings" },
            ]}
            value={mode}
            onChange={setMode}
          />
        </div>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
              />
              <Tooltip
                cursor={{ stroke: "var(--color-border-strong)", strokeDasharray: 4 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  boxShadow: "var(--shadow-raised)",
                  fontSize: 13,
                  color: "var(--color-text)",
                }}
                formatter={(value: number) =>
                  mode === "earnings"
                    ? [formatMoney(value, currency), "Earnings"]
                    : [`${value}h`, "Hours"]
                }
              />
              <Area
                type="monotone"
                dataKey={mode}
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#activityFill)"
                dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">Recent time entries</h2>
          {completed.length > 0 && (
            <Link
              href="/time-tracker"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          )}
        </div>
        {completed.length === 0 ? (
          <EmptyState
            title="No time entries yet"
            description="Start the timer above or add a manual entry — your work and earnings will show up here."
            action={{ label: "Open time tracker", onClick: () => router.push("/time-tracker") }}
          />
        ) : (
          <EntriesTable entries={completed.slice(0, 8)} />
        )}
      </div>
    </div>
  );
}
