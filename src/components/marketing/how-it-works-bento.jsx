import {
  Clock3,
  DollarSign,
  FolderKanban,
  Link2,
  Play,
  Plus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";

function BentoCard({
  className,
  visual,
  title,
  description,
  number,
  tall = false,
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 p-3 shadow-[0_18px_50px_rgba(2,6,23,.35)] sm:p-3.5",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex flex-1 items-center justify-center overflow-hidden rounded-[22px] bg-[radial-gradient(120%_90%_at_50%_0%,rgba(37,99,235,.22),transparent_58%),linear-gradient(180deg,#0f172a_0%,#0b1220_100%)]",
          tall ? "min-h-[200px] sm:min-h-[236px]" : "min-h-[168px] sm:min-h-[188px]",
        )}
      >
        {number && (
          <span className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-blue-300">
            {number}
          </span>
        )}
        {visual}
      </div>
      <div className="px-3 pb-3 pt-5 sm:px-4 sm:pb-4">
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-white sm:text-[1.45rem]">
          {title}
        </h3>
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}

function AddWorkVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center px-5" aria-hidden="true">
      <div className="relative w-full max-w-[250px] rounded-2xl border border-white/10 bg-slate-950/70 p-3 pr-11 shadow-[0_12px_30px_rgba(2,6,23,.35)]">
        <div className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,.4)]">
          <Plus className="size-3.5" strokeWidth={2.4} />
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-bold text-white">
            AC
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-slate-100">
              Website Redesign
            </p>
            <p className="mt-0.5 text-[9px] text-slate-400">Acme Corporation</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/5 bg-slate-900/70 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-[10px] font-bold text-white">
            NS
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-slate-200">
              Mobile App
            </p>
            <p className="mt-0.5 text-[9px] text-slate-500">Nova Studio</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackingVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center" aria-hidden="true">
      <div className="absolute size-40 rounded-full bg-blue-500/10 sm:size-44" />
      <div className="absolute size-[7.5rem] rounded-full bg-blue-500/16 sm:size-32" />
      <div className="relative flex size-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_16px_36px_rgba(37,99,235,.45)] sm:size-[4.5rem]">
        <Play className="ml-0.5 size-6 fill-current" />
      </div>
      <span className="absolute left-[12%] top-[28%] rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[9px] font-semibold text-slate-300">
        Website Redesign
      </span>
      <span className="absolute bottom-[24%] right-[10%] rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-semibold text-white shadow-sm">
        Billable
      </span>
    </div>
  );
}

function ReviewVisual() {
  const bars = [42, 58, 49, 86, 64, 28, 18];

  return (
    <div className="relative flex h-full w-[82%] max-w-[260px] items-end justify-center pb-4" aria-hidden="true">
      <span className="absolute right-[14%] top-10 rounded-xl border border-white/10 bg-slate-950/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-200">
        +12% this week
      </span>
      <div className="flex h-[118px] w-full items-end justify-between gap-1.5 px-2">
        {bars.map((height, index) => (
          <div
            key={index}
            className={cn(
              "w-full max-w-6 rounded-t-md",
              index === 3
                ? "bg-gradient-to-t from-blue-700 to-blue-400"
                : "bg-blue-500/25",
            )}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ValueVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center" aria-hidden="true">
      <div className="absolute size-40 rounded-full bg-blue-500/10 sm:size-48" />
      <div className="absolute size-[7.75rem] rounded-full bg-blue-500/16 sm:size-36" />
      <div className="relative flex size-[5.25rem] flex-col items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,.4)] sm:size-24">
        <span className="text-lg font-semibold tracking-[-0.04em] sm:text-xl">
          $5.4k
        </span>
        <span className="text-[8px] font-medium text-blue-100">Earned</span>
      </div>
      <span className="absolute left-[10%] top-[30%] rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[9px] font-semibold text-slate-300">
        108h 15m billable
      </span>
      <span className="absolute bottom-[26%] right-[8%] rounded-full border border-emerald-400/20 bg-slate-950/80 px-2.5 py-1 text-[9px] font-semibold text-emerald-400">
        +12.6%
      </span>
    </div>
  );
}

function WorkspaceVisual() {
  const nodes = [
    { label: "Clients", icon: Users, className: "left-[8%] top-[22%]" },
    { label: "Projects", icon: FolderKanban, className: "right-[8%] top-[22%]" },
    { label: "Timer", icon: Clock3, className: "left-[10%] bottom-[22%]" },
    { label: "Earnings", icon: DollarSign, className: "right-[8%] bottom-[22%]" },
  ];

  return (
    <div className="relative h-full w-full max-w-[340px]" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 340 180" fill="none">
        <path d="M96 48 C140 48 140 90 170 90" stroke="#1D4ED8" strokeOpacity="0.45" strokeWidth="1.5" />
        <path d="M244 48 C200 48 200 90 170 90" stroke="#1D4ED8" strokeOpacity="0.45" strokeWidth="1.5" />
        <path d="M96 132 C140 132 140 90 170 90" stroke="#1D4ED8" strokeOpacity="0.45" strokeWidth="1.5" />
        <path d="M244 132 C200 132 200 90 170 90" stroke="#1D4ED8" strokeOpacity="0.45" strokeWidth="1.5" />
      </svg>
      <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_14px_32px_rgba(37,99,235,.32)]">
        <Link2 className="size-6" />
      </div>
      {nodes.map(({ label, icon: Icon, className }) => (
        <div
          key={label}
          className={cn(
            "absolute flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/90 px-2.5 py-1.5 shadow-[0_8px_20px_rgba(2,6,23,.4)]",
            className,
          )}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-slate-800 text-blue-300">
            <Icon className="size-3.5" strokeWidth={1.8} />
          </span>
          <span className="text-[10px] font-semibold text-slate-200">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function HowItWorksBento() {
  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-6">
      <BentoCard
        className="md:col-span-2"
        number="01"
        title="Add your work"
        description="Create clients and projects."
        visual={<AddWorkVisual />}
      />
      <BentoCard
        className="md:col-span-2"
        number="02"
        title="Start tracking"
        description="Start a timer when you begin working."
        visual={<TrackingVisual />}
      />
      <BentoCard
        className="md:col-span-2"
        number="03"
        title="Review your hours"
        description="See your daily, weekly and monthly activity."
        visual={<ReviewVisual />}
      />
      <BentoCard
        className="md:col-span-3"
        number="04"
        title="Know your value"
        description="Understand your billable hours and earnings."
        visual={<ValueVisual />}
        tall
      />
      <BentoCard
        className="md:col-span-3"
        title="One workspace"
        description="Clients, timers, hours and earnings stay in one place."
        visual={<WorkspaceVisual />}
        tall
      />
    </div>
  );
}
