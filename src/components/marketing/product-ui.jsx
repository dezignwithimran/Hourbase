"use client";

import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleStop,
  Clock3,
  Command,
  DollarSign,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

function MiniBrand({ inverse = false }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold text-white">
        H
      </span>
      <span
        className={cn(
          "text-xs font-semibold tracking-[-0.02em]",
          inverse ? "text-white" : "text-slate-900",
        )}
      >
        Hourbase
      </span>
    </div>
  );
}

function Avatar({ initials = "IK" }) {
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-[9px] font-semibold text-white ring-2 ring-white">
      {initials}
    </span>
  );
}

function DashboardChrome({ label = "Workspace" }) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-slate-200/80 px-3 sm:px-5">
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
          <span className="size-2 rounded-full bg-slate-200" />
          <span className="size-2 rounded-full bg-slate-200" />
          <span className="size-2 rounded-full bg-slate-200" />
        </div>
        <MiniBrand />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3">
        <span className="hidden text-[10px] font-medium text-slate-400 sm:block">
          {label}
        </span>
        <span
          className="hidden size-7 items-center justify-center rounded-lg text-slate-400 sm:flex"
          aria-hidden="true"
        >
          <Search className="size-3.5" />
        </span>
        <span
          className="hidden size-7 items-center justify-center rounded-lg text-slate-400 sm:flex"
          aria-hidden="true"
        >
          <Bell className="size-3.5" />
        </span>
        <Avatar />
      </div>
    </div>
  );
}

const sidebarItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Time", icon: Clock3 },
  { label: "Projects", icon: FolderKanban },
  { label: "Clients", icon: Users },
  { label: "Reports", icon: BarChart3 },
];

function DashboardSidebar({ active = "Overview" }) {
  return (
    <aside className="hidden w-[144px] shrink-0 flex-col justify-between border-r border-slate-200/80 bg-slate-50/60 p-3 md:flex lg:w-[164px]">
      <div>
        <p className="mb-2 px-2 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Workspace
        </p>
        <div className="space-y-0.5">
          {sidebarItems.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-medium",
                label === active
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/70"
                  : "text-slate-500",
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] text-slate-500">
          <Settings className="size-3.5" aria-hidden="true" />
          Settings
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-semibold text-slate-500">Pro plan</span>
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[7px] font-bold text-blue-600">
              72%
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[72%] rounded-full bg-blue-600" />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function ProductFrame({
  children,
  className,
  label,
}) {
  return (
    <div
      className={cn(
        "product-frame overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_80px_rgba(15,23,42,.11),0_3px_14px_rgba(15,23,42,.04)] sm:rounded-[22px]",
        className,
      )}
    >
      <DashboardChrome label={label} />
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  featured,
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border p-3 sm:p-4",
        featured
          ? "border-blue-100 bg-blue-50/60"
          : "border-slate-200/80 bg-white",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[9px] font-medium text-slate-500 sm:text-[10px]">
          {label}
        </span>
        <Icon
          className={cn("size-3.5", featured ? "text-blue-600" : "text-slate-400")}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 truncate text-lg font-semibold tracking-[-0.04em] text-slate-950 sm:text-xl">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[8px] text-slate-400 sm:text-[9px]">
        {detail}
      </p>
    </div>
  );
}

const weeklyValues = [4.8, 6.5, 5.3, 8.1, 6.9, 2.4, 0.8];
const weeklyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeeklyBarChart({ compact = false }) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-2",
        compact ? "h-[92px]" : "h-[118px]",
      )}
      role="img"
      aria-label="Weekly activity chart: highest activity on Thursday at 8.1 hours"
    >
      {weeklyValues.map((value, index) => (
        <div key={weeklyLabels[index]} className="flex h-full flex-1 flex-col justify-end">
          <div className="relative flex flex-1 items-end justify-center">
            <div
              className={cn(
                "w-full max-w-7 rounded-t-[5px] transition-all duration-500",
                index === 3
                  ? "bg-blue-600 shadow-[0_5px_12px_rgba(37,99,235,.2)]"
                  : "bg-blue-100",
              )}
              style={{ height: `${(value / 8.5) * 100}%` }}
              title={`${weeklyLabels[index]}: ${value} hours`}
            />
          </div>
          <span className="mt-2 text-center text-[7px] font-medium text-slate-400 sm:text-[8px]">
            {weeklyLabels[index]}
          </span>
        </div>
      ))}
    </div>
  );
}

function ActiveTimerCard() {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl bg-slate-950 p-3.5 text-white sm:flex-row sm:items-center sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <span className="timer-pulse absolute size-2 rounded-full bg-emerald-400" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[10px] font-semibold sm:text-xs">
              Website Redesign
            </p>
            <span className="hidden rounded bg-blue-500/20 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-blue-300 sm:inline">
              Billable
            </span>
          </div>
          <p className="mt-0.5 truncate text-[8px] text-slate-400 sm:text-[9px]">
            Acme Corporation · Homepage concepts
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="font-mono text-base font-medium tabular-nums tracking-tight sm:text-lg">
          02:18:42
        </span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-white text-slate-950">
          <Pause className="size-3.5 fill-current" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

export function HeroDashboard() {
  const projects = [
    { name: "Website Redesign", client: "Acme Corp", time: "2h 18m", color: "bg-blue-500" },
    { name: "Mobile App", client: "Nova Studio", time: "1h 42m", color: "bg-violet-500" },
    { name: "Brand Strategy", client: "Northstar", time: "54m", color: "bg-amber-500" },
  ];

  const entries = [
    { project: "Website Redesign", client: "Acme Corp", time: "2h 18m", amount: "$115.00" },
    { project: "Mobile App", client: "Nova Studio", time: "1h 42m", amount: "$85.00" },
    { project: "Research & planning", client: "Northstar", time: "54m", amount: "$45.00" },
  ];

  return (
    <ProductFrame className="hero-product">
      <div className="flex">
        <DashboardSidebar />
        <div className="min-w-0 flex-1 bg-[#fbfcfe] p-3 sm:p-5 lg:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-blue-600 sm:text-[9px]">
                Wednesday, September 9
              </p>
              <h3 className="mt-1 text-base font-semibold tracking-[-0.035em] text-slate-950 sm:text-xl">
                Good morning, Imran
              </h3>
            </div>
            <span
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[9px] font-semibold text-slate-600 shadow-sm sm:flex"
            >
              <Plus className="size-3" />
              Add time
            </span>
          </div>

          <div className="mt-3 sm:mt-5">
            <ActiveTimerCard />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-3">
            <StatCard
              label="Today's tracked hours"
              value="6h 24m"
              detail="+1h 12m vs. yesterday"
              icon={Clock3}
            />
            <StatCard
              label="Billable hours"
              value="5h 42m"
              detail="89% of tracked time"
              icon={BriefcaseBusiness}
            />
            <StatCard
              label="Today's earnings"
              value="$285.00"
              detail="$50 average rate"
              icon={DollarSign}
              featured
            />
          </div>

          <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-[1.55fr_1fr]">
            <section className="rounded-xl border border-slate-200/80 bg-white p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                    Weekly activity
                  </p>
                  <p className="mt-0.5 text-[8px] text-slate-400">34h 48m tracked</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-600">
                  +12.4%
                </span>
              </div>
              <div className="mt-3">
                <WeeklyBarChart compact />
              </div>
            </section>

            <section className="hidden rounded-xl border border-slate-200/80 bg-white p-4 sm:block">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-800">Recent projects</p>
                <MoreHorizontal className="size-3.5 text-slate-400" />
              </div>
              <div className="mt-3.5 space-y-3.5">
                {projects.map((project) => (
                  <div key={project.name} className="flex items-center gap-2.5">
                    <span className={cn("size-2 rounded-full", project.color)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[9px] font-semibold text-slate-700">
                        {project.name}
                      </p>
                      <p className="truncate text-[8px] text-slate-400">{project.client}</p>
                    </div>
                    <span className="text-[8px] font-semibold text-slate-500">
                      {project.time}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white sm:mt-4">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 sm:px-4">
              <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                Recent time entries
              </p>
              <span className="text-[8px] font-semibold text-blue-600">View all</span>
            </div>
            <div className="divide-y divide-slate-100">
              {entries.map((entry, index) => (
                <div
                  key={`${entry.project}-${index}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2 sm:grid-cols-[1.4fr_1fr_auto_auto] sm:px-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[8px] font-semibold text-slate-700 sm:text-[9px]">
                      {entry.project}
                    </p>
                    <p className="mt-0.5 truncate text-[7px] text-slate-400 sm:hidden">
                      {entry.client}
                    </p>
                  </div>
                  <span className="hidden truncate text-[8px] text-slate-400 sm:block">
                    {entry.client}
                  </span>
                  <span className="text-[8px] font-medium text-slate-500">{entry.time}</span>
                  <span className="hidden text-right text-[8px] font-semibold text-slate-700 sm:block">
                    {entry.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </ProductFrame>
  );
}

function LineChart() {
  return (
    <svg
      viewBox="0 0 560 180"
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label="Weekly hours trend increasing from Monday to Friday"
    >
      <defs>
        <linearGradient id="hours-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity=".16" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 65, 105, 145].map((y) => (
        <line
          key={y}
          x1="0"
          x2="560"
          y1={y}
          y2={y}
          stroke="#E2E8F0"
          strokeWidth="1"
          strokeDasharray="3 6"
        />
      ))}
      <path
        d="M0 142 C45 135 62 116 103 119 C146 123 164 85 210 91 C249 96 275 61 318 72 C360 82 388 42 430 51 C478 61 508 22 560 31 L560 180 L0 180 Z"
        fill="url(#hours-fill)"
      />
      <path
        d="M0 142 C45 135 62 116 103 119 C146 123 164 85 210 91 C249 96 275 61 318 72 C360 82 388 42 430 51 C478 61 508 22 560 31"
        fill="none"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {[0, 103, 210, 318, 430, 560].map((x, index) => {
        const ys = [142, 119, 91, 72, 51, 31];
        return (
          <g key={x}>
            <circle cx={x} cy={ys[index]} r="5" fill="white" stroke="#2563EB" strokeWidth="3" />
          </g>
        );
      })}
    </svg>
  );
}

export function OverviewDashboard() {
  const activity = [
    { name: "Website Redesign", client: "Acme Corp", time: "2h 18m", amount: "$115" },
    { name: "Product discovery", client: "Nova Studio", time: "1h 42m", amount: "$85" },
    { name: "Campaign concepts", client: "Northstar", time: "1h 06m", amount: "$55" },
    { name: "Admin & email", client: "Internal", time: "42m", amount: "—" },
  ];

  return (
    <ProductFrame label="Overview">
      <div className="flex">
        <DashboardSidebar />
        <div className="min-w-0 flex-1 bg-[#fbfcfe] p-3 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-blue-600">TODAY'S OVERVIEW</p>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.035em] text-slate-950 sm:text-2xl">
                Wednesday, September 9
              </h3>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-semibold text-slate-600">
                This week <ChevronDown className="size-3" />
              </span>
              <span className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[9px] font-semibold text-white">
                <Plus className="size-3" /> Add time
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4 sm:gap-3">
            <StatCard label="Weekly hours" value="34h 48m" detail="of 40h target" icon={Clock3} />
            <StatCard label="Billable amount" value="$1,624" detail="89% billable" icon={DollarSign} featured />
            <StatCard label="Active projects" value="6" detail="across 4 clients" icon={FolderKanban} />
            <StatCard label="Avg. workday" value="6h 58m" detail="+24m this week" icon={TrendingUp} />
          </div>

          <div className="mt-3 grid gap-3 sm:mt-4 lg:grid-cols-[1.65fr_1fr]">
            <section className="rounded-xl border border-slate-200/80 bg-white p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                    Weekly hours
                  </p>
                  <p className="mt-0.5 text-[8px] text-slate-400">Sep 7 – Sep 13</p>
                </div>
                <div className="flex items-center gap-1.5 text-[8px] text-slate-400">
                  <span className="size-1.5 rounded-full bg-blue-600" /> Tracked hours
                </div>
              </div>
              <div className="mt-5">
                <LineChart />
              </div>
              <div className="mt-2 flex justify-between text-[7px] font-medium text-slate-400 sm:text-[8px]">
                {weeklyLabels.slice(0, 6).map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200/80 bg-white p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                    Project summary
                  </p>
                  <p className="mt-0.5 text-[8px] text-slate-400">This week</p>
                </div>
                <MoreHorizontal className="size-4 text-slate-400" />
              </div>
              <div className="mt-5 flex justify-center">
                <div
                  className="relative flex size-24 items-center justify-center rounded-full sm:size-28"
                  style={{
                    background:
                      "conic-gradient(#2563EB 0 42%, #7C3AED 42% 68%, #F59E0B 68% 86%, #E2E8F0 86% 100%)",
                  }}
                  role="img"
                  aria-label="Project hours: Acme 42%, Nova 26%, Northstar 18%, Other 14%"
                >
                  <div className="flex size-[68%] flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-base font-semibold tracking-[-0.04em] text-slate-900 sm:text-lg">
                      34.8h
                    </span>
                    <span className="text-[7px] text-slate-400">Total</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2">
                {[
                  ["Acme", "bg-blue-600"],
                  ["Nova", "bg-violet-600"],
                  ["Northstar", "bg-amber-500"],
                  ["Other", "bg-slate-200"],
                ].map(([name, color]) => (
                  <div key={name} className="flex items-center gap-2 text-[8px] text-slate-500">
                    <span className={cn("size-1.5 rounded-full", color)} />
                    {name}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white sm:mt-4">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3 sm:px-5">
              <div>
                <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                  Recent activity
                </p>
                <p className="mt-0.5 text-[8px] text-slate-400">Your latest time entries</p>
              </div>
              <span className="text-[8px] font-semibold text-blue-600">View timesheet</span>
            </div>
            <div className="divide-y divide-slate-100">
              {activity.map((item, index) => (
                <div
                  key={item.name}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5 px-3 py-2.5 sm:grid-cols-[auto_1.5fr_1fr_auto_auto] sm:px-5"
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      ["bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-slate-300"][index],
                    )}
                  />
                  <span className="truncate text-[8px] font-semibold text-slate-700 sm:text-[9px]">
                    {item.name}
                  </span>
                  <span className="hidden truncate text-[8px] text-slate-400 sm:block">
                    {item.client}
                  </span>
                  <span className="text-[8px] text-slate-500">{item.time}</span>
                  <span className="hidden w-10 text-right text-[8px] font-semibold text-slate-700 sm:block">
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </ProductFrame>
  );
}

function formatTimer(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, "0")).join(":");
}

export function TimerPanel() {
  const [elapsed, setElapsed] = useState(2 * 3600 + 18 * 60 + 42);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const stop = () => {
    setRunning(false);
    setElapsed(0);
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_30px_80px_rgba(15,23,42,.25)] sm:p-8 lg:p-10">
      <div className="absolute left-1/2 top-0 h-40 w-3/4 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <MiniBrand inverse />
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span
              className={cn(
                "size-1.5 rounded-full",
                running ? "timer-pulse bg-emerald-400" : "bg-slate-500",
              )}
            />
            {running ? "Timer running" : elapsed === 0 ? "Timer stopped" : "Timer paused"}
          </div>
        </div>

        <div className="py-9 text-center sm:py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            <span
              className={cn(
                "size-1.5 rounded-full",
                running ? "bg-emerald-400" : "bg-slate-500",
              )}
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-300">
              {running ? "Tracking" : elapsed === 0 ? "Ready" : "Paused"}
            </span>
          </div>
          <p
            className="timer-digits mt-5 font-mono text-[2.9rem] font-medium leading-none tabular-nums tracking-[-0.075em] text-white sm:text-6xl lg:text-7xl"
            aria-live="polite"
          >
            {formatTimer(elapsed)}
          </p>
          <div className="mt-7">
            <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
              {elapsed === 0 ? "Select a project to begin" : "Website Redesign"}
            </h3>
            <p className="mt-1.5 text-sm text-slate-400">
              {elapsed === 0 ? "Your next session is ready" : "Acme Corporation"}
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            className="flex h-12 touch-manipulation items-center justify-center gap-2 rounded-xl bg-white font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
          >
            {running ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
            {running ? "Pause" : elapsed === 0 ? "Start" : "Resume"}
          </button>
          <button
            type="button"
            onClick={stop}
            className="flex h-12 touch-manipulation items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/10"
          >
            <CircleStop className="size-4" />
            Stop
          </button>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Billable
          </span>
          <span>·</span>
          <span>$50.00 / hour</span>
        </div>
      </div>
    </div>
  );
}

function EarningsLineChart() {
  return (
    <svg
      viewBox="0 0 620 230"
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label="Earnings chart showing income growth over six months"
    >
      <defs>
        <linearGradient id="earnings-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity=".18" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 85, 140, 195].map((y) => (
        <line
          key={y}
          x1="0"
          x2="620"
          y1={y}
          y2={y}
          stroke="#E2E8F0"
          strokeDasharray="4 7"
        />
      ))}
      <path
        d="M0 184 C58 175 73 147 124 153 C181 160 196 119 248 128 C301 137 329 91 372 99 C421 108 457 59 496 71 C544 85 567 37 620 45 L620 230 L0 230Z"
        fill="url(#earnings-fill)"
      />
      <path
        d="M0 184 C58 175 73 147 124 153 C181 160 196 119 248 128 C301 137 329 91 372 99 C421 108 457 59 496 71 C544 85 567 37 620 45"
        fill="none"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="620" cy="45" r="6" fill="white" stroke="#2563EB" strokeWidth="3" />
    </svg>
  );
}

export function EarningsPanel() {
  const stats = [
    { value: "124h 30m", label: "Tracked", change: "+8.4%" },
    { value: "108h 15m", label: "Billable", change: "86.9%" },
    { value: "$5,412", label: "Earned", change: "+12.6%" },
  ];

  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,.08)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-slate-900">Earnings overview</p>
          <p className="mt-0.5 text-[10px] text-slate-400">September 2026</p>
        </div>
        <span className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600">
          This month <ChevronDown className="size-3" />
        </span>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between p-4 sm:block sm:p-5">
            <div>
              <p className="text-[10px] font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-2xl">
                {stat.value}
              </p>
            </div>
            <span className="mt-2 inline-flex rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">
              {stat.change}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800">Earnings</p>
            <p className="mt-0.5 text-[9px] text-slate-400">Billable value over time</p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
            <span className="size-2 rounded-full bg-blue-600" />
            Earned
          </div>
        </div>
        <div className="mt-7">
          <EarningsLineChart />
        </div>
        <div className="mt-2 flex justify-between text-[8px] font-medium text-slate-400">
          {["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WorkOverviewPanel() {
  const projects = [
    {
      initials: "AC",
      name: "Website Redesign",
      client: "Acme Corporation",
      hours: "42h 30m",
      amount: "$2,125",
      progress: 68,
      color: "bg-blue-600",
      selected: true,
    },
    {
      initials: "NS",
      name: "Mobile App",
      client: "Nova Studio",
      hours: "31h 15m",
      amount: "$1,562",
      progress: 52,
      color: "bg-violet-600",
      selected: false,
    },
    {
      initials: "NL",
      name: "Brand Strategy",
      client: "Northline Labs",
      hours: "18h 45m",
      amount: "$938",
      progress: 35,
      color: "bg-amber-500",
      selected: false,
    },
  ];

  const clients = [
    { client: "Acme Corp", project: "Website Redesign", hours: "42h 30m", amount: "$2,125", share: 40, color: "bg-blue-600", bar: "bg-blue-600" },
    { client: "Nova Studio", project: "Mobile App", hours: "31h 15m", amount: "$1,562", share: 29, color: "bg-violet-600", bar: "bg-violet-600" },
    { client: "Northline Labs", project: "Brand Strategy", hours: "18h 45m", amount: "$938", share: 18, color: "bg-amber-500", bar: "bg-amber-500" },
  ];

  return (
    <ProductFrame label="Work">
      <div className="flex">
        <DashboardSidebar active="Projects" />
        <div className="min-w-0 flex-1 bg-[#fbfcfe]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-3 py-3 sm:px-5">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
              <span className="rounded-md bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-900 shadow-sm">
                Projects
              </span>
              <span className="px-3 py-1.5 text-[10px] font-medium text-slate-500">Clients</span>
            </div>
            <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-semibold text-slate-500">
              Sep 2026 · 108h 15m
            </span>
          </div>

          <div className="grid lg:grid-cols-2">
            <div className="border-b border-slate-200/80 p-3 sm:p-5 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                    Active projects
                  </p>
                  <p className="mt-0.5 text-[8px] text-slate-400">6 projects across 4 clients</p>
                </div>
                <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Plus className="size-3.5" />
                </span>
              </div>
              <div className="space-y-2.5">
                {projects.map((project) => (
                  <article
                    key={project.name}
                    className={cn(
                      "rounded-xl border p-3.5 sm:p-4",
                      project.selected
                        ? "border-blue-200 bg-blue-50/50 shadow-sm"
                        : "border-slate-200 bg-white",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white",
                          project.color,
                        )}
                      >
                        {project.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {project.name}
                        </p>
                        <p className="mt-0.5 truncate text-[9px] text-slate-400">
                          {project.client}
                        </p>
                      </div>
                      <MoreHorizontal className="size-4 text-slate-400" />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-slate-700">{project.hours}</p>
                      <p className="text-[10px] font-semibold text-slate-700">{project.amount}</p>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn("h-full rounded-full", project.color)}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="p-3 sm:p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                    Time by client
                  </p>
                  <p className="mt-0.5 text-[8px] text-slate-400">Where September hours went</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-700">$5,412</span>
              </div>

              <div className="flex items-center gap-5">
                <div
                  className="relative flex size-28 shrink-0 items-center justify-center rounded-full sm:size-32"
                  style={{
                    background:
                      "conic-gradient(#2563EB 0 40%, #7C3AED 40% 69%, #F59E0B 69% 87%, #E2E8F0 87%)",
                  }}
                  role="img"
                  aria-label="Client earnings: Acme 40%, Nova 29%, Northline 18%"
                >
                  <div className="flex size-[72%] flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-lg font-semibold tracking-[-0.04em] text-slate-900 sm:text-xl">
                      $5.4k
                    </span>
                    <span className="text-[8px] text-slate-400">Earned</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  {clients.map((client) => (
                    <div key={client.client}>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2 truncate text-[9px] font-medium text-slate-600">
                          <span className={cn("size-1.5 shrink-0 rounded-full", client.color)} />
                          {client.client}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-700">
                          {client.share}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn("h-full rounded-full", client.bar)}
                          style={{ width: `${client.share * 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {clients.slice(0, 2).map((client) => (
                  <div
                    key={client.client}
                    className="grid grid-cols-[1fr_auto] gap-3 px-3 py-3 sm:grid-cols-[1.2fr_1fr_auto_auto] sm:px-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-slate-700">
                        {client.client}
                      </p>
                      <p className="mt-0.5 truncate text-[8px] text-slate-400 sm:hidden">
                        {client.project}
                      </p>
                    </div>
                    <span className="hidden truncate text-[9px] text-slate-400 sm:block">
                      {client.project}
                    </span>
                    <span className="text-[9px] text-slate-500">{client.hours}</span>
                    <span className="hidden text-[9px] font-semibold text-slate-700 sm:block">
                      {client.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProductFrame>
  );
}

export function AnalyticsDashboard() {
  const bars = [
    { billable: 72, nonBillable: 20 },
    { billable: 58, nonBillable: 14 },
    { billable: 84, nonBillable: 12 },
    { billable: 66, nonBillable: 22 },
    { billable: 91, nonBillable: 8 },
    { billable: 76, nonBillable: 15 },
    { billable: 88, nonBillable: 9 },
    { billable: 64, nonBillable: 18 },
    { billable: 95, nonBillable: 4 },
    { billable: 82, nonBillable: 12 },
    { billable: 73, nonBillable: 17 },
    { billable: 89, nonBillable: 7 },
  ];

  return (
    <ProductFrame label="Reports">
      <div className="flex">
        <DashboardSidebar active="Reports" />
        <div className="min-w-0 flex-1 bg-[#fbfcfe] p-3 sm:p-5 lg:p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                Reports
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-slate-950 sm:text-2xl">
                Time analytics
              </h3>
            </div>
            <span className="hidden h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-semibold text-slate-600 sm:flex">
              <CalendarDays className="size-3" /> Sep 1 – Sep 30
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4 sm:gap-3">
            <StatCard label="Total hours" value="124h 30m" detail="+8.4% last month" icon={Clock3} />
            <StatCard label="Billable" value="108h 15m" detail="86.9% of total" icon={BriefcaseBusiness} />
            <StatCard label="Earnings" value="$5,412" detail="+12.6% last month" icon={DollarSign} featured />
            <StatCard label="Avg. rate" value="$50.00" detail="+$2.50 this month" icon={TrendingUp} />
          </div>

          <div className="mt-3 grid gap-3 sm:mt-4 lg:grid-cols-[1.55fr_1fr]">
            <section className="rounded-xl border border-slate-200/80 bg-white p-3 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                    Hours over time
                  </p>
                  <p className="mt-0.5 text-[8px] text-slate-400">Billable vs non-billable</p>
                </div>
                <div className="flex gap-3 text-[7px] text-slate-400 sm:text-[8px]">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-blue-600" /> Billable
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-blue-100" /> Non-billable
                  </span>
                </div>
              </div>
              <div className="mt-6 flex h-36 items-end justify-between gap-1.5 sm:gap-2">
                {bars.map((bar, index) => (
                  <div key={index} className="flex h-full flex-1 flex-col justify-end">
                    <div className="flex flex-col-reverse overflow-hidden rounded-t-[4px]">
                      <div
                        className="bg-blue-600"
                        style={{ height: `${bar.billable * 1.25}px` }}
                      />
                      <div
                        className="bg-blue-100"
                        style={{ height: `${bar.nonBillable * 1.25}px` }}
                      />
                    </div>
                    <span className="mt-2 text-center text-[6px] text-slate-400">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200/80 bg-white p-3 sm:p-5">
              <div>
                <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                  Billable split
                </p>
                <p className="mt-0.5 text-[8px] text-slate-400">September</p>
              </div>
              <div className="mt-5 flex items-center justify-center">
                <div
                  className="relative flex size-28 items-center justify-center rounded-full sm:size-32"
                  style={{
                    background: "conic-gradient(#2563EB 0 86.9%, #DBEAFE 86.9% 100%)",
                  }}
                >
                  <div className="flex size-[72%] flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-xl font-semibold tracking-[-0.05em] text-slate-900">
                      86.9%
                    </span>
                    <span className="text-[8px] text-slate-400">Billable</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-blue-50 p-2.5">
                  <p className="text-[8px] text-blue-500">Billable</p>
                  <p className="mt-1 text-[10px] font-semibold text-blue-700">108h 15m</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[8px] text-slate-400">Non-billable</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-600">16h 15m</p>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-3 rounded-xl border border-slate-200/80 bg-white p-3 sm:mt-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                  Project breakdown
                </p>
                <p className="mt-0.5 text-[8px] text-slate-400">Hours and earnings by project</p>
              </div>
              <span className="text-[8px] font-semibold text-blue-600">View report</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { name: "Website Redesign", hours: "42h 30m", amount: "$2,125", width: "82%", color: "bg-blue-600" },
                { name: "Mobile App", hours: "31h 15m", amount: "$1,562", width: "64%", color: "bg-violet-600" },
                { name: "Brand Strategy", hours: "18h 45m", amount: "$938", width: "42%", color: "bg-amber-500" },
              ].map((project) => (
                <div key={project.name} className="rounded-lg border border-slate-100 p-3">
                  <p className="truncate text-[9px] font-semibold text-slate-700">{project.name}</p>
                  <div className="mt-3 h-1 rounded-full bg-slate-100">
                    <div
                      className={cn("h-full rounded-full", project.color)}
                      style={{ width: project.width }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[8px]">
                    <span className="text-slate-400">{project.hours}</span>
                    <span className="font-semibold text-slate-700">{project.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </ProductFrame>
  );
}

export function FloatingSummaryCard() {
  return (
    <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_14px_40px_rgba(15,23,42,.12)] sm:flex">
      <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Check className="size-4" />
      </span>
      <div>
        <p className="text-[9px] font-semibold text-slate-800">Week on track</p>
        <p className="mt-0.5 text-[8px] text-slate-400">34h 48m logged</p>
      </div>
    </div>
  );
}

export function ShortcutHint() {
  return (
    <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[9px] text-slate-500 shadow-sm sm:flex">
      <Command className="size-3" />
      <span>Quick add</span>
      <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[8px]">
        T
      </kbd>
    </div>
  );
}

export function ExportHint() {
  return (
    <div className="flex items-center gap-2 text-[9px] text-slate-500">
      <FileText className="size-3.5" />
      Export reports in one click
    </div>
  );
}
