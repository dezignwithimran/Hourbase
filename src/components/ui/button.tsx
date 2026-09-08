"use client";

import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border font-medium whitespace-nowrap transition-all duration-200",
        "box-border leading-none disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "btn-primary-shine border-primary bg-primary text-white hover:border-primary-dark hover:bg-primary-dark",
        variant === "secondary" &&
          "border-transparent bg-muted text-text hover:bg-border",
        variant === "ghost" &&
          "border-transparent text-text-secondary hover:bg-muted hover:text-text",
        variant === "danger" &&
          "border-danger/20 bg-danger-soft text-danger hover:bg-danger hover:text-white",
        variant === "outline" &&
          "border-border bg-surface text-text hover:border-border-strong hover:bg-surface-2",
        size === "icon" ? "h-10 w-10" : "h-10 px-4 text-sm",
        className,
      )}
      {...props}
    />
  );
});

export function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition hover:bg-muted hover:text-text",
        className,
      )}
      {...props}
    />
  );
}
