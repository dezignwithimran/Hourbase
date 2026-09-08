"use client";

import { DateFilter } from "@/components/date-filter";
import { Button } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { KpiCard } from "@/components/ui/kpi";
import { Tabs } from "@/components/ui/tabs";
import { downloadCsv } from "@/lib/csv";
import { formatHours, formatMoney, formatPercent } from "@/lib/calculations";
import { DatePreset, DateRange, rangeForPreset } from "@/lib/dates";
import { downloadReportPdf } from "@/lib/pdf";
import { earningsByKey, entriesInRange, hoursByDay, hoursByKey, reportMetrics } from "@/lib/stats";
import { useStore } from "@/lib/store/provider";
import { BarChart3, Clock, DollarSign, Download, Gauge, Zap } from "@/components/ui/icons";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const palette = ["#2563eb", "#4f46e5", "#7c3aed", "#0ea5e9", "#16a34a", "#f59e0b"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  boxShadow: "var(--shadow-raised)",
  fontSize: 13,
  color: "var(--color-text)",
} as const;

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function BreakdownCard({
  title,
  data,
  suffix,
}: {
  title: string;
  data: { name: string; value: number }[];
  suffix: string;
}) {
  const max = data[0]?.value || 1;
  return (
    <Card>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <ul className="mt-4 space-y-3.5">
        {data.map((item, i) => (
          <li key={item.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium text-text">{item.name}</span>
              <span className="num ml-3 shrink-0 font-semibold text-text">
                {item.value.toFixed(1)}
                {suffix}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(4, (item.value / max) * 100)}%`,
                  background: palette[i % palette.length],
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function ReportsPage() {
  const { timeEntries, projects, clients, profile } = useStore();
  const [tab, setTab] = useState("time");
  const [preset, setPreset] = useState<DatePreset>("month");
  const [custom, setCustom] = useState<DateRange>(rangeForPreset("month"));
  const range = preset === "custom" ? custom : rangeForPreset(preset, custom);
  const entries = entriesInRange(timeEntries, range);
  const metrics = reportMetrics(entries);
  const currency = profile?.currency ?? "USD";
  const projectNames = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const clientNames = Object.fromEntries(clients.map((c) => [c.id, c.name]));
  const byProject = earningsByKey(entries, "projectId", projectNames);
  const byClient = earningsByKey(entries, "clientId", clientNames);
  const topProjects = useMemo(() => byProject.slice(0, 5), [byProject]);
  const daily = useMemo(() => hoursByDay(entries, range), [entries, range]);

  function exportCsv() {
    downloadCsv("report.csv", [
      ["Metric", "Value"],
      ["Tracked hours", metrics.tracked.toFixed(2)],
      ["Billable hours", metrics.billable.toFixed(2)],
      ["Non-billable hours", metrics.nonBillable.toFixed(2)],
      ["Billable %", metrics.billablePct.toFixed(1)],
      ["Earnings", metrics.earnings.toFixed(2)],
      ["Average rate", metrics.avgRate.toFixed(2)],
    ]);
  }

  function exportPdf() {
    downloadReportPdf("Time report", [
      `Tracked ${metrics.tracked.toFixed(1)}h`,
      `Billable ${metrics.billable.toFixed(1)}h (${formatPercent(metrics.billablePct)})`,
      `Earnings ${formatMoney(metrics.earnings, currency)}`,
      `Average rate ${formatMoney(metrics.avgRate, currency)}`,
    ]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Understand where time goes and what it earns."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" onClick={exportPdf}>
              <Download className="h-4 w-4" /> PDF
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DateFilter preset={preset} onPreset={setPreset} custom={custom} onCustom={setCustom} />
          <Tabs
            tabs={[
              { id: "time", label: "Time" },
              { id: "earnings", label: "Earnings" },
              { id: "productivity", label: "Productivity" },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>
      </PageHeader>

      {entries.length === 0 ? (
        <EmptyState
          icon={<BarChart3 />}
          title="No data for this range"
          description="Track time in the selected period and reports will populate automatically."
        />
      ) : (
        <>
          {tab === "time" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="Tracked"
                  value={formatHours(metrics.tracked * 3600)}
                  hint="in selected range"
                  icon={<Clock />}
                />
                <KpiCard
                  label="Billable"
                  value={formatHours(metrics.billable * 3600)}
                  hint="invoiceable work"
                  icon={<Zap />}
                  accent="warning"
                />
                <KpiCard
                  label="Non-billable"
                  value={formatHours(metrics.nonBillable * 3600)}
                  hint="admin and internal"
                  icon={<Clock />}
                  accent="neutral"
                />
                <KpiCard
                  label="Billable share"
                  value={formatPercent(metrics.billablePct)}
                  hint="of tracked time"
                  icon={<Gauge />}
                  accent="success"
                />
              </div>

              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-text">Hours per day</h2>
                    <p className="mt-0.5 text-sm text-text-secondary">
                      Billable hours shown in blue, non-billable in grey.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <Legend color="#2563eb" label="Billable" />
                    <Legend color="var(--color-border-strong)" label="Non-billable" />
                  </div>
                </div>
                <div className="mt-6 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={daily} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={44}
                        tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                      />
                      <Tooltip
                        cursor={{ fill: "var(--color-muted)" }}
                        contentStyle={tooltipStyle}
                        formatter={(value: number, key) => [
                          `${value}h`,
                          key === "billable" ? "Billable" : "Non-billable",
                        ]}
                      />
                      <Bar
                        dataKey="billable"
                        stackId="h"
                        fill="#2563eb"
                        maxBarSize={36}
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="nonBillable"
                        stackId="h"
                        fill="var(--color-border-strong)"
                        maxBarSize={36}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="grid gap-4 xl:grid-cols-2">
                <BreakdownCard
                  title="Hours by project"
                  data={hoursByKey(entries, "projectId", projectNames)}
                  suffix="h"
                />
                <BreakdownCard
                  title="Hours by client"
                  data={hoursByKey(entries, "clientId", clientNames)}
                  suffix="h"
                />
              </div>
            </div>
          )}

          {tab === "earnings" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <KpiCard
                  label="Total earnings"
                  value={formatMoney(metrics.earnings, currency)}
                  icon={<DollarSign />}
                  accent="success"
                />
                <KpiCard
                  label="Average rate"
                  value={formatMoney(metrics.avgRate, currency)}
                  icon={<Gauge />}
                />
                <KpiCard
                  label="Billable hours"
                  value={formatHours(metrics.billable * 3600)}
                  icon={<Zap />}
                  accent="warning"
                />
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <EarningsChart title="Earnings by project" data={byProject} currency={currency} />
                <EarningsChart title="Earnings by client" data={byClient} currency={currency} />
              </div>
            </div>
          )}

          {tab === "productivity" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <KpiCard
                  label="Billable utilization"
                  value={formatPercent(metrics.billablePct)}
                  icon={<Gauge />}
                  accent="success"
                />
                <KpiCard
                  label="Days of capacity used"
                  value={(metrics.tracked / Math.max(1, profile?.workingHoursPerDay ?? 8)).toFixed(
                    1,
                  )}
                  hint={`${profile?.workingHoursPerDay ?? 8}h workday`}
                  icon={<Clock />}
                />
                <KpiCard
                  label="Effective rate"
                  value={formatMoney(metrics.avgRate, currency)}
                  icon={<DollarSign />}
                  accent="neutral"
                />
              </div>
              <Card>
                <h2 className="text-base font-semibold text-text">Most productive projects</h2>
                <ul className="mt-4 space-y-3">
                  {topProjects.map((p, i) => {
                    const max = topProjects[0]?.value || 1;
                    return (
                      <li key={p.name}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-text">{p.name}</span>
                          <span className="num font-semibold text-text">
                            {formatMoney(p.value, currency)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(4, (p.value / max) * 100)}%`,
                              background: palette[i % palette.length],
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EarningsChart({
  title,
  data,
  currency,
}: {
  title: string;
  data: { name: string; value: number }[];
  currency: string;
}) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <div className="mt-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
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
              width={56}
              tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)" }}
              contentStyle={tooltipStyle}
              formatter={(value: number) => [formatMoney(value, currency), "Earnings"]}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {data.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
