"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarRange,
  Check,
  Clock,
  FileText,
  FolderKanban,
  HelpCircle,
  Monitor,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
  X,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store/provider";
import { CommandPalette } from "@/components/search/command-palette";
import { TimerPanel } from "@/components/timer/timer-panel";
import { Avatar, BrandMark } from "@/components/ui/avatar";
import { PageLoader } from "@/components/ui/feedback";
import { formatDuration } from "@/lib/calculations";
import {
  APPEARANCE_ORDER,
  cycleAppearance,
  isDarkAppearance,
  nextAppearanceLabel,
} from "@/lib/appearance";
import { liveDuration } from "@/lib/store/helpers";
import { formatRenewsAt, getPlan, isPaidPlan, usage } from "@/lib/billing";
import type { Appearance } from "@/lib/types";
import { ProBadge } from "@/components/ui/pro-badge";
import { useEffect, useRef, useState } from "react";

const navGroups = [
  {
    label: "Track",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/time-tracker", label: "Time Tracker", icon: Clock },
      { href: "/timesheets", label: "Timesheets", icon: CalendarRange },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/team", label: "Team", icon: Sparkles, pro: true },
    ],
  },
  {
    label: "Get paid",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/invoices", label: "Invoices", icon: FileText },
    ],
  },
];

const mobileNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/time-tracker", label: "Timer", icon: Clock },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/timesheets", label: "Sheets", icon: CalendarRange },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, user, profile, projects, activeTimer, updateProfile, logout } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [, setTick] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profile?.onboardingCompleted && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [ready, user, profile, pathname, router]);

  useEffect(() => {
    setDrawer(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (activeTimer?.status !== "running") return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [activeTimer?.status]);

  useEffect(() => {
    if (!menu) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menu]);

  if (!ready) return <PageLoader />;
  if (!user) return null;

  const now = new Date();
  const hour = now.getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const appearance: Appearance = profile?.appearance ?? "system";
  const nextMode = cycleAppearance(appearance);
  const resolvedDark = isDarkAppearance(appearance);

  const sidebar = (mobile: boolean) => (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2.5 px-3",
          collapsed && !mobile && "h-auto flex-col justify-center gap-2 px-2 py-3",
        )}
      >
        <BrandMark />
        {(!collapsed || mobile) && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">Hourbase</p>
            <p className="truncate text-[11px] text-text-secondary">Time & invoices</p>
          </div>
        )}
        {!mobile && (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-surface text-text-secondary transition hover:bg-muted hover:text-text"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}
        {mobile && (
          <button
            type="button"
            onClick={() => setDrawer(false)}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 text-text-secondary hover:bg-muted"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pt-3">
        {navGroups.map((group) => (
          <div key={group.label}>
            {(!collapsed || mobile) && (
              <p className="mb-1 px-2.5 text-[10px] font-semibold tracking-[0.1em] text-text-tertiary uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed && !mobile ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition",
                      collapsed && !mobile && "justify-center px-0",
                      active
                        ? "bg-primary-soft font-semibold text-primary"
                        : "font-medium text-text-secondary hover:bg-muted hover:text-text",
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {(!collapsed || mobile) && (
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        {item.label}
                        {"pro" in item && item.pro ? <ProBadge /> : null}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 px-3 pb-3">
        {(!collapsed || mobile) && (
          <div className="mb-3 rounded-2xl bg-primary-soft/70 p-3.5">
            <p className="text-[13px] font-semibold text-text">{getPlan(profile?.plan).name} plan</p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
              {isPaidPlan(profile?.plan)
                ? formatRenewsAt(profile?.planRenewsAt)
                  ? `Renews ${formatRenewsAt(profile?.planRenewsAt)}.`
                  : "Paid plan is active."
                : usage("projects", projects.length, profile?.plan).label +
                  ". Upgrade for unlimited projects."}
            </p>
            <Link
              href="/billing"
              className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
            >
              {isPaidPlan(profile?.plan) ? "Manage plan" : "Upgrade"}
            </Link>
          </div>
        )}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition",
            collapsed && !mobile && "justify-center px-0",
            isActive(pathname, "/settings") || isActive(pathname, "/billing")
              ? "bg-primary-soft font-semibold text-primary"
              : "text-text-secondary hover:bg-muted hover:text-text",
          )}
        >
          <Settings className="h-4.5 w-4.5" />
          {(!collapsed || mobile) && "Settings"}
        </Link>
        <Link
          href="/help"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition",
            collapsed && !mobile && "justify-center px-0",
            isActive(pathname, "/help")
              ? "bg-primary-soft font-semibold text-primary"
              : "text-text-secondary hover:bg-muted hover:text-text",
          )}
        >
          <HelpCircle className="h-4.5 w-4.5" />
          {(!collapsed || mobile) && "Help & Support"}
        </Link>
      </div>

      <div className="relative p-3" ref={menuRef}>
        {menu && (
          <div className="animate-scale-in absolute bottom-[72px] left-3 z-50 w-[min(240px,calc(100%-24px))] overflow-hidden rounded-2xl border border-border/80 bg-surface p-1.5 shadow-pop">
            <div className="px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
              Color mode
            </div>
            <div className="mx-1 mb-1 rounded-lg bg-muted p-1">
              {APPEARANCE_ORDER.map((mode) => {
                const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : Monitor;
                const active = appearance === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition",
                      active
                        ? "bg-surface font-medium text-text shadow-xs"
                        : "text-text-secondary hover:text-text",
                    )}
                    onClick={() => updateProfile({ appearance: mode })}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {mode === "system" ? "System" : mode === "dark" ? "Dark" : "Light"}
                    {active ? <Check className="ml-auto h-3.5 w-3.5 text-primary" /> : null}
                  </button>
                );
              })}
            </div>
            <Link
              href="/settings"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-muted hover:text-text"
            >
              <Settings className="h-4 w-4" />
              Account settings
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger transition hover:bg-danger-soft"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          className={cn(
            "flex w-full items-center gap-3.5 rounded-2xl p-2 text-left transition hover:bg-muted",
            collapsed && !mobile && "justify-center",
          )}
        >
          <Avatar name={profile?.name || "User"} src={profile?.avatar || undefined} size="sm" />
          {(!collapsed || mobile) && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-text">
                {profile?.name || "Your account"}
              </span>
              <span className="block truncate text-[11px] text-text-secondary">
                {profile?.email}
              </span>
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen app-canvas">
      <CommandPalette />

      <aside
        className={cn(
          "fixed top-3 bottom-3 left-3 z-30 hidden overflow-hidden rounded-[24px] border border-border/70 bg-sidebar/90 shadow-card backdrop-blur-xl transition-[width] duration-200 lg:block",
          collapsed ? "w-[76px]" : "w-[264px]",
        )}
      >
        {sidebar(false)}
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-slate-900/30 backdrop-blur-md"
            onClick={() => setDrawer(false)}
          />
          <aside className="animate-slide-in absolute inset-y-3 left-3 w-[280px] overflow-hidden rounded-[24px] border border-border/70 bg-sidebar shadow-pop">
            {sidebar(true)}
          </aside>
        </div>
      )}

      <div className={cn("transition-[padding] duration-200 lg:pr-3", collapsed ? "lg:pl-[100px]" : "lg:pl-[288px]")}>
        <div className="sticky top-0 z-20 lg:top-3">
          <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
            <header className="glass flex h-14 items-center gap-3 border-b border-border/60 px-4 md:px-5 lg:rounded-2xl lg:border">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="rounded-xl border border-border p-2 text-text-secondary transition hover:bg-muted hover:text-text lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {hello}, {profile?.name?.split(" ")[0] || "there"}
            </p>
            <p className="hidden truncate text-xs text-text-secondary sm:block">{today}</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {activeTimer && (
              <Link
                href="/time-tracker"
                className={cn(
                  "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition sm:flex",
                  activeTimer.status === "running"
                    ? "border-success/25 bg-success-soft text-success"
                    : "border-warning/25 bg-warning-soft text-warning",
                )}
              >
                <span className="relative flex h-2 w-2">
                  {activeTimer.status === "running" && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  )}
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                </span>
                <span className="num">{formatDuration(liveDuration(activeTimer))}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("ftt-search"))}
              className="hidden items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3.5 py-1.5 text-[13px] text-text-tertiary transition hover:border-border-strong hover:text-text-secondary md:flex md:w-60"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search…</span>
              <kbd className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("ftt-search"))}
              className="rounded-lg p-2 text-text-secondary transition hover:bg-muted hover:text-text md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => updateProfile({ appearance: nextMode })}
              className="rounded-lg p-2 text-text-secondary transition hover:bg-muted hover:text-text"
              aria-label={nextAppearanceLabel(nextMode)}
              title={
                appearance === "system"
                  ? `System (${resolvedDark ? "dark" : "light"})`
                  : appearance === "dark"
                    ? "Dark"
                    : "Light"
              }
            >
              {appearance === "dark" ? (
                <Moon className="h-4.5 w-4.5" />
              ) : appearance === "light" ? (
                <Sun className="h-4.5 w-4.5" />
              ) : (
                <Monitor className="h-4.5 w-4.5" />
              )}
            </button>

            {!activeTimer && (
              <Link
                href="/time-tracker"
                className="btn-primary-shine hidden h-10 items-center gap-2 rounded-xl border border-primary bg-primary px-4 text-sm font-medium text-white transition hover:border-primary-dark hover:bg-primary-dark sm:inline-flex"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Start timer
              </Link>
            )}
          </div>
            </header>
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 pb-28 md:px-6 lg:px-8 lg:pt-8 lg:pb-10">
          {children}
        </main>
      </div>

      <nav className="glass fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border pb-[env(safe-area-inset-bottom)] lg:hidden">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                active ? "text-primary" : "text-text-secondary",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition",
                  active && "bg-primary-soft",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function MiniTimer() {
  return (
    <div className="mb-6">
      <TimerPanel compact />
    </div>
  );
}
