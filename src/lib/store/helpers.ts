"use client";

import { earningsFromDuration, invoiceLineAmount, invoiceTotal } from "@/lib/calculations";
import { combineDateAndTime } from "@/lib/dates";
import { isPlanId, isPlanInterval } from "@/lib/billing";
import type {
  Client,
  Invoice,
  Profile,
  Project,
  ProjectStatus,
  SessionUser,
  SupportTicket,
  TeamMember,
  TimeEntry,
} from "@/lib/types";

const KEY = "ftt.db.v1";
const SESSION_KEY = "ftt.session.v1";

export type LocalUser = {
  id: string;
  email: string;
  passwordHash: string;
};

export type AppState = {
  users: LocalUser[];
  profiles: Profile[];
  clients: Client[];
  projects: Project[];
  timeEntries: TimeEntry[];
  invoices: Invoice[];
};

export const emptyState = (): AppState => ({
  users: [],
  profiles: [],
  clients: [],
  projects: [],
  timeEntries: [],
  invoices: [],
});

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeProfile(profile: Profile): Profile {
  return {
    ...profile,
    plan: isPlanId(profile.plan) ? profile.plan : "free",
    planInterval: isPlanInterval(profile.planInterval) ? profile.planInterval : "monthly",
    planStatus: profile.planStatus === "canceled" ? "canceled" : "active",
    planRenewsAt: profile.planRenewsAt ?? null,
    stripeCustomerId: profile.stripeCustomerId ?? null,
    stripeSubscriptionId: profile.stripeSubscriptionId ?? null,
    paddleCustomerId: profile.paddleCustomerId ?? null,
    paddleSubscriptionId: profile.paddleSubscriptionId ?? null,
    teamMembers: asList<TeamMember>(profile.teamMembers),
    supportTickets: asList<SupportTicket>(profile.supportTickets),
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = { ...emptyState(), ...JSON.parse(raw) } as AppState;
    const base = {
      ...parsed,
      profiles: (parsed.profiles ?? []).map(normalizeProfile),
    };
    const next = healOrphanClients(base);
    if (next !== base) saveState(next);
    return next;
  } catch {
    return emptyState();
  }
}

export function clientLabel(
  project: Pick<Project, "clientId" | "clientName">,
  clients: Client[],
): string {
  return clients.find((c) => c.id === project.clientId)?.name || project.clientName || "—";
}

/** Recreate or reattach clients that projects still point at after a failed save. */
export function healOrphanClients(state: AppState): AppState {
  const known = new Set(state.clients.map((c) => c.id));
  const orphans = state.projects.filter((p) => p.clientId && !known.has(p.clientId));
  if (!orphans.length) return state;

  const extra: Client[] = [];
  const reassign = new Map<string, string>();

  const byUser = new Map<string, Project[]>();
  for (const p of orphans) {
    const list = byUser.get(p.userId) ?? [];
    list.push(p);
    byUser.set(p.userId, list);
  }

  for (const [userId, userOrphans] of byUser) {
    const existing = state.clients.filter((c) => c.userId === userId);
    const named = userOrphans.filter((p) => p.clientName?.trim());

    for (const p of named) {
      if (known.has(p.clientId)) continue;
      known.add(p.clientId);
      extra.push(blankClient(p.clientId, userId, p.clientName!.trim(), p.createdAt));
    }

    const unnamed = userOrphans.filter((p) => !p.clientName?.trim());
    if (!unnamed.length) continue;

    if (existing.length === 1) {
      for (const p of unnamed) reassign.set(p.id, existing[0].id);
      continue;
    }

    for (const p of unnamed) {
      if (known.has(p.clientId)) continue;
      known.add(p.clientId);
      extra.push(blankClient(p.clientId, userId, "Untitled client", p.createdAt));
    }
  }

  const clients = extra.length ? [...state.clients, ...extra] : state.clients;
  const projects = reassign.size
    ? state.projects.map((p) => {
        const clientId = reassign.get(p.id);
        if (!clientId) return p;
        const name = clients.find((c) => c.id === clientId)?.name;
        return { ...p, clientId, clientName: name ?? p.clientName };
      })
    : extra.length
      ? state.projects.map((p) => {
          const name = clients.find((c) => c.id === p.clientId)?.name;
          return name ? { ...p, clientName: p.clientName || name } : p;
        })
      : state.projects;
  const timeEntries = reassign.size
    ? state.timeEntries.map((e) => {
        const clientId = reassign.get(e.projectId);
        return clientId ? { ...e, clientId } : e;
      })
    : state.timeEntries;

  return { ...state, clients, projects, timeEntries };
}

function blankClient(id: string, userId: string, name: string, createdAt: string): Client {
  return { id, userId, name, company: "", email: "", phone: "", notes: "", createdAt };
}

export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(user: SessionUser | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`ftt:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function uid(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function defaultProfile(id: string, name: string, email: string): Profile {
  return {
    id,
    name,
    email,
    avatar: "",
    company: "",
    bio: "",
    country: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    currency: "USD",
    defaultHourlyRate: 75,
    workingHoursPerDay: 8,
    appearance: "system",
    notifyTimerReminders: true,
    notifyWeeklySummary: true,
    notifyInvoiceReminders: true,
    onboardingCompleted: false,
    plan: "free",
    planInterval: "monthly",
    planStatus: "active",
    planRenewsAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    paddleCustomerId: null,
    paddleSubscriptionId: null,
    teamMembers: [],
    supportTickets: [],
    createdAt: nowIso(),
  };
}

export function liveDuration(entry: TimeEntry, at = new Date()): number {
  if (entry.status === "running") {
    return Math.max(0, Math.round((at.getTime() - new Date(entry.startTime).getTime()) / 1000));
  }
  return entry.duration;
}

export function nextInvoiceNumber(invoices: Invoice[]): string {
  const max = invoices.reduce((acc, inv) => {
    const n = Number(inv.invoiceNumber.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `INV-${String(max + 1).padStart(4, "0")}`;
}

export function recalcInvoice(inv: Invoice): Invoice {
  const items = inv.items.map((item) => ({
    ...item,
    amount: invoiceLineAmount(item.quantity, item.rate),
  }));
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  return {
    ...inv,
    items,
    subtotal,
    total: invoiceTotal(subtotal, inv.discount, inv.tax),
  };
}

export function completeEntry(
  entry: TimeEntry,
  end: Date,
  duration: number,
): TimeEntry {
  return {
    ...entry,
    endTime: end.toISOString(),
    duration,
    earnings: earningsFromDuration(entry.billable, duration, entry.hourlyRate),
    status: "completed",
  };
}

export function buildManualEntry(input: {
  userId: string;
  project: Project;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  billable: boolean;
}): TimeEntry {
  const start = combineDateAndTime(input.date, input.startTime);
  const end = combineDateAndTime(input.date, input.endTime);
  const duration = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
  return {
    id: uid(),
    userId: input.userId,
    projectId: input.project.id,
    clientId: input.project.clientId,
    description: input.description,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    duration,
    billable: input.billable,
    hourlyRate: input.project.hourlyRate,
    earnings: earningsFromDuration(input.billable, duration, input.project.hourlyRate),
    status: "completed",
    createdAt: nowIso(),
  };
}

export type ProjectStatusFilter = ProjectStatus | "all";

export function projectRateOrDefault(project: Project, profile: Profile): number {
  return project.hourlyRate || profile.defaultHourlyRate;
}
