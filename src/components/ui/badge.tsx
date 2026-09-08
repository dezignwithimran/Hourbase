"use client";

import { cn } from "@/lib/cn";
import { InvoiceStatus, ProjectStatus } from "@/lib/types";

const project: Record<ProjectStatus, string> = {
  active: "bg-success-soft text-success ring-success/20",
  paused: "bg-warning-soft text-warning ring-warning/20",
  completed: "bg-primary-soft text-primary ring-primary/20",
  archived: "bg-muted text-text-secondary ring-border",
};

const invoice: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-text-secondary ring-border",
  sent: "bg-primary-soft text-primary ring-primary/20",
  paid: "bg-success-soft text-success ring-success/20",
  overdue: "bg-danger-soft text-danger ring-danger/20",
  cancelled: "bg-muted text-text-tertiary ring-border",
};

export function Badge({
  children,
  className,
  dot,
}: {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" /> : null}
      {children}
    </span>
  );
}

export function ProjectBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge dot className={project[status]}>
      {status}
    </Badge>
  );
}

export function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge dot className={invoice[status]}>
      {status}
    </Badge>
  );
}

export function BillableBadge({ billable }: { billable: boolean }) {
  return (
    <Badge
      dot
      className={
        billable
          ? "bg-success-soft text-success ring-success/20"
          : "bg-muted text-text-secondary ring-border"
      }
    >
      {billable ? "Billable" : "Non-billable"}
    </Badge>
  );
}

export function TrendPill({ change }: { change?: number | null }) {
  if (change == null || !Number.isFinite(change)) {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-text-tertiary">
        No prior data
      </span>
    );
  }
  const up = change >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        up ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("h-3 w-3", !up && "rotate-180")}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m5 15 7-7 7 7" />
      </svg>
      {Math.abs(change).toFixed(0)}%
    </span>
  );
}
