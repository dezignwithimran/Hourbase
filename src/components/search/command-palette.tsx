"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Search,
  Users,
} from "@/components/ui/icons";
import { useStore } from "@/lib/store/provider";
import { cn } from "@/lib/cn";

type Result = {
  href: string;
  label: string;
  meta?: string;
  kind: "Project" | "Client" | "Time" | "Invoice" | "Page";
};

const icons = {
  Project: FolderKanban,
  Client: Users,
  Time: Clock,
  Invoice: FileText,
  Page: LayoutDashboard,
};

const pages: Result[] = [
  { href: "/dashboard", label: "Dashboard", kind: "Page" },
  { href: "/time-tracker", label: "Time Tracker", kind: "Page" },
  { href: "/timesheets", label: "Timesheets", kind: "Page" },
  { href: "/projects", label: "Projects", kind: "Page" },
  { href: "/clients", label: "Clients", kind: "Page" },
  { href: "/reports", label: "Reports", kind: "Page" },
  { href: "/invoices", label: "Invoices", kind: "Page" },
  { href: "/team", label: "Team", kind: "Page" },
  { href: "/billing", label: "Plan & billing", kind: "Page" },
  { href: "/settings", label: "Settings", kind: "Page" },
  { href: "/help", label: "Help & Support", kind: "Page" },
];

export function CommandPalette() {
  const { projects, clients, timeEntries, invoices } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onSearch() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("ftt-search", onSearch);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ftt-search", onSearch);
    };
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return pages.slice(0, 6);
    const items: Result[] = [];
    for (const p of projects) {
      if (p.name.toLowerCase().includes(query)) {
        items.push({
          href: `/projects/${p.id}`,
          label: p.name,
          meta: clients.find((c) => c.id === p.clientId)?.name,
          kind: "Project",
        });
      }
    }
    for (const c of clients) {
      if (
        c.name.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query)
      ) {
        items.push({ href: `/clients/${c.id}`, label: c.name, meta: c.company, kind: "Client" });
      }
    }
    for (const e of timeEntries.slice(0, 60)) {
      if (e.description.toLowerCase().includes(query)) {
        items.push({
          href: "/time-tracker",
          label: e.description,
          meta: projects.find((p) => p.id === e.projectId)?.name,
          kind: "Time",
        });
      }
    }
    for (const i of invoices) {
      if (i.invoiceNumber.toLowerCase().includes(query)) {
        items.push({
          href: `/invoices/${i.id}`,
          label: i.invoiceNumber,
          meta: clients.find((c) => c.id === i.clientId)?.name,
          kind: "Invoice",
        });
      }
    }
    for (const page of pages) {
      if (page.label.toLowerCase().includes(query)) items.push(page);
    }
    return items.slice(0, 12);
  }, [q, projects, clients, timeEntries, invoices]);

  useEffect(() => setCursor(0), [q]);

  function go(result: Result) {
    router.push(result.href);
    setOpen(false);
    setQ("");
  }

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-75 bg-slate-900/30 p-4 backdrop-blur-md"
      onClick={() => setOpen(false)}
    >
      <div
        className="animate-scale-in mx-auto mt-[10vh] max-w-xl overflow-hidden rounded-panel border border-border bg-surface shadow-pop"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setCursor((c) => Math.min(c + 1, results.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setCursor((c) => Math.max(c - 1, 0));
          }
          if (e.key === "Enter" && results[cursor]) go(results[cursor]);
        }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-text-tertiary" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, clients, time, invoices…"
            className="h-13 w-full bg-transparent text-sm text-text outline-none placeholder:text-text-tertiary"
          />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-text-secondary sm:block">
            ESC
          </kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-10 text-center text-sm text-text-secondary">
              No matches for “{q}”
            </li>
          ) : (
            results.map((r, i) => {
              const Icon = icons[r.kind];
              return (
                <li key={`${r.href}-${r.label}-${i}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                      cursor === i ? "bg-primary-soft text-primary" : "hover:bg-muted",
                    )}
                    onClick={() => go(r)}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        cursor === i
                          ? "bg-surface text-primary shadow-xs"
                          : "bg-primary-soft text-primary",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text">
                        {r.label}
                      </span>
                      {r.meta ? (
                        <span className="block truncate text-xs text-text-secondary">{r.meta}</span>
                      ) : null}
                    </span>
                    <span className="text-[11px] font-medium text-text-tertiary">{r.kind}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center gap-4 border-t border-border bg-surface-2 px-4 py-2.5 text-[11px] text-text-secondary">
          <span>↑↓ to navigate</span>
          <span>↵ to open</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}
