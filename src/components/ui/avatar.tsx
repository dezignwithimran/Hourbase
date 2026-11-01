import { cn } from "@/lib/cn";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimension =
    size === "sm" ? "h-7 w-7 text-[11px]" : size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";

  if (src) {
    return (
      // Avatars come from arbitrary user-supplied URLs, so next/image optimization is skipped.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn("shrink-0 rounded-full object-cover ring-1 ring-border", dimension, className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "brand-gradient flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        dimension,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 items-center justify-center overflow-hidden rounded-[9px] bg-white shadow-sm ring-1 ring-slate-200",
        className,
      )}
    >
      <HourbaseGlyph className="h-8 w-8" />
    </span>
  );
}

export function HourbaseGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path
        d="M10.5 8.5v15M21.5 8.5v15M10.5 16h11"
        stroke="#165DFC"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M24.5 5.5A13 13 0 0 1 28 16"
        stroke="#165DFC"
        strokeOpacity="0.45"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
