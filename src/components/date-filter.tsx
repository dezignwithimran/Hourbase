"use client";

import { DatePreset, DateRange, toDateInput } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";

const presets: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "custom", label: "Custom" },
];

export function DateFilter({
  preset,
  onPreset,
  custom,
  onCustom,
}: {
  preset: DatePreset;
  onPreset: (p: DatePreset) => void;
  custom: DateRange;
  onCustom: (r: DateRange) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-lg bg-muted p-0.5">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPreset(p.id)}
            className={cn(
              "rounded-[7px] px-3 py-1.5 text-[13px] font-medium transition",
              preset === p.id
                ? "bg-surface text-text shadow-xs"
                : "text-text-secondary hover:text-text",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={toDateInput(custom.start)}
            onChange={(e) =>
              onCustom({ start: new Date(`${e.target.value}T00:00:00`), end: custom.end })
            }
            className="w-auto"
          />
          <span className="text-sm text-text-tertiary">to</span>
          <Input
            type="date"
            value={toDateInput(custom.end)}
            onChange={(e) =>
              onCustom({ start: custom.start, end: new Date(`${e.target.value}T23:59:59`) })
            }
            className="w-auto"
          />
        </div>
      )}
    </div>
  );
}
