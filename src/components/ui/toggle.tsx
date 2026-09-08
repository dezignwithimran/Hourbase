"use client";

import { cn } from "@/lib/cn";

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5.5 w-10 shrink-0 rounded-full transition-colors duration-200",
          checked
            ? "bg-primary shadow-[inset_0_1px_0_0_rgb(255_255_255/0.18)]"
            : "bg-border-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-xs transition-transform duration-200",
            checked && "translate-x-4.5",
          )}
        />
      </button>
      {label ? (
        <span className="min-w-0">
          <span className="block text-sm font-medium text-text">{label}</span>
          {description ? (
            <span className="block text-xs text-text-secondary">{description}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
