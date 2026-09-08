"use client";

import { cn } from "@/lib/cn";

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl bg-muted/80 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-medium transition",
            value === tab.id
              ? "bg-surface text-text shadow-xs"
              : "text-text-secondary hover:text-text",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex rounded-2xl bg-muted p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-xl font-medium transition",
            size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[13px]",
            value === option.id
              ? "bg-surface text-text shadow-xs"
              : "text-text-secondary hover:text-text",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
