import { cn } from "@/lib/cn";

export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-primary px-1.5 py-px text-[10px] font-semibold tracking-wide text-white uppercase",
        className,
      )}
    >
      Pro
    </span>
  );
}
