import { cn } from "@/lib/cn";
import { TrendPill } from "./badge";

export function KpiCard({
  label,
  value,
  hint,
  change,
  icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  change?: number | null;
  icon?: React.ReactNode;
  accent?: "primary" | "success" | "warning" | "neutral";
}) {
  return (
    <div className="group relative overflow-hidden rounded-panel border border-border/80 bg-surface p-6 card-surface">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-text-tertiary uppercase">
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-2xl [&>svg]:h-4 [&>svg]:w-4",
              accent === "primary" && "bg-primary-soft text-primary",
              accent === "success" && "bg-success-soft text-success",
              accent === "warning" && "bg-warning-soft text-warning",
              accent === "neutral" && "bg-muted text-text-secondary",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="num mt-3 text-[28px] leading-none font-semibold text-text">{value}</p>
      <div className="mt-3 flex min-h-5 flex-wrap items-center gap-2">
        {change !== undefined ? <TrendPill change={change} /> : null}
        {hint ? <span className="text-xs text-text-secondary">{hint}</span> : null}
      </div>
    </div>
  );
}

export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "muted";
}) {
  return (
    <div className="rounded-card border border-border/80 bg-surface p-5 card-surface">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-text-tertiary uppercase">
        {label}
      </p>
      <p
        className={cn(
          "num mt-1.5 text-xl font-semibold",
          tone === "success" && "text-success",
          tone === "muted" && "text-text-secondary",
          tone === "default" && "text-text",
        )}
      >
        {value}
      </p>
    </div>
  );
}
