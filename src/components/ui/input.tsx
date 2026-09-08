"use client";

import { cn } from "@/lib/cn";
import { Eye, EyeOff } from "@/components/ui/icons";
import { timeZoneOptions } from "@/lib/timezones";
import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useState,
} from "react";

const field =
  "w-full rounded-xl border border-border bg-surface-2/80 px-3.5 text-sm text-text outline-none transition " +
  "placeholder:text-text-tertiary hover:border-border-strong hover:bg-surface " +
  "focus:border-ring/40 focus:bg-surface focus:ring-4 focus:ring-ring/10 focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-muted disabled:text-text-secondary";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(field, "h-10", className)} {...props} />;
  },
);

export function PasswordInput({
  className,
  autoComplete = "current-password",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className={cn(field, "h-10 pr-10", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-1.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-tertiary transition hover:bg-muted hover:text-text"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(field, "min-h-24 py-2.5", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(field, "h-10 cursor-pointer appearance-none pr-9", className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
        }}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export function TimezoneSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (tz: string) => void;
  className?: string;
}) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    setOptions(timeZoneOptions());
  }, []);

  const selected = value || "UTC";
  const known = options.some((option) => option.value === selected);

  return (
    <Select value={selected} onChange={(e) => onChange(e.target.value)} className={className}>
      {options.length === 0 || !known ? (
        <option value={selected}>{selected.replace(/_/g, " ")}</option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-[13px] font-medium text-text", className)}
    >
      {children}
    </label>
  );
}

export function Field({
  label,
  children,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-text-secondary">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <svg
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-tertiary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input className={cn(field, "h-10 pl-9")} {...props} />
    </div>
  );
}
