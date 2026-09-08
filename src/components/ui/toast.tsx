"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type ToastKind = "success" | "error" | "warning" | "info";

type ToastItem = { id: string; message: string; kind: ToastKind };

const listeners = new Set<(items: ToastItem[]) => void>();
let items: ToastItem[] = [];

export function toast(message: string, kind: ToastKind = "success") {
  const id = crypto.randomUUID();
  items = [...items, { id, message, kind }];
  listeners.forEach((l) => l(items));
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    listeners.forEach((l) => l(items));
  }, 4200);
}

const icons: Record<ToastKind, React.ReactNode> = {
  success: <path d="m5 13 4 4L19 7" />,
  error: <path d="M18 6 6 18M6 6l12 12" />,
  warning: <path d="M12 8v5M12 17h.01" />,
  info: <path d="M12 16v-5M12 8h.01" />,
};

export function ToastViewport() {
  const [list, setList] = useState<ToastItem[]>([]);
  useEffect(() => {
    listeners.add(setList);
    setList(items);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-80 flex w-[min(100%-2rem,380px)] flex-col gap-2">
      {list.map((t) => (
        <div
          key={t.id}
          role="status"
          className="animate-slide-in pointer-events-auto flex items-start gap-3 rounded-card border border-border bg-surface px-4 py-3 text-sm text-text shadow-pop"
        >
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
              t.kind === "success" && "bg-success-soft text-success",
              t.kind === "error" && "bg-danger-soft text-danger",
              t.kind === "warning" && "bg-warning-soft text-warning",
              t.kind === "info" && "bg-primary-soft text-primary",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {icons[t.kind]}
            </svg>
          </span>
          <span className="leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
