"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { earningsFromDuration } from "@/lib/calculations";
import { assertCanCreate, renewsOn } from "@/lib/billing";
import type {
  Client,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  PlanId,
  PlanInterval,
  Profile,
  Project,
  ProjectStatus,
  SessionUser,
  TimeEntry,
} from "@/lib/types";
import {
  AppState,
  buildManualEntry,
  completeEntry,
  defaultProfile,
  emptyState,
  hashPassword,
  liveDuration,
  loadSession,
  loadState,
  nextInvoiceNumber,
  normalizeProfile,
  nowIso,
  projectRateOrDefault,
  recalcInvoice,
  saveSession,
  saveState,
  uid,
  healOrphanClients,
} from "./helpers";
import {
  clientRow,
  entryRow,
  invoiceRow,
  itemRow,
  loadCloudData,
  profileToRow,
  projectRow,
} from "./supabase-io";
import { applyAppearance } from "@/lib/appearance";
import { toast } from "@/components/ui/toast";

export { applyAppearance } from "@/lib/appearance";

type ManualEntryInput = {
  date: string;
  startTime: string;
  endTime: string;
  projectId: string;
  description: string;
  billable: boolean;
};

type Store = {
  ready: boolean;
  usingSupabase: boolean;
  user: SessionUser | null;
  profile: Profile | null;
  clients: Client[];
  projects: Project[];
  timeEntries: TimeEntry[];
  invoices: Invoice[];
  activeTimer: TimeEntry | null;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  completeOnboarding: (input: {
    profile: Partial<Profile>;
    projectName?: string;
    clientName?: string;
    hourlyRate: number;
    billingType: Project["billingType"];
  }) => Promise<void>;
  skipOnboarding: () => Promise<void>;
  createClient: (input: Omit<Client, "id" | "userId" | "createdAt">) => Promise<Client>;
  updateClient: (id: string, patch: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  createProject: (
    input: Omit<Project, "id" | "userId" | "createdAt" | "clientName"> & {
      newClient?: Omit<Client, "id" | "userId" | "createdAt">;
    },
  ) => Promise<Project>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  startTimer: (input: {
    projectId: string;
    description: string;
    billable: boolean;
  }) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  addManualEntry: (input: ManualEntryInput) => Promise<void>;
  updateEntry: (id: string, patch: Partial<TimeEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  duplicateEntry: (id: string) => Promise<void>;
  createInvoice: (input: {
    clientId: string;
    invoiceNumber?: string;
    issueDate: string;
    dueDate: string;
    items: Omit<InvoiceItem, "id" | "invoiceId">[];
    discount: number;
    tax: number;
    notes?: string;
  }) => Promise<Invoice>;
  updateInvoice: (id: string, patch: Partial<Invoice>) => Promise<void>;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  changePlan: (plan: PlanId, interval: PlanInterval) => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

function userSlice(state: AppState, userId: string) {
  const profile = state.profiles.find((p) => p.id === userId) ?? null;
  return {
    profile: profile ? normalizeProfile(profile) : null,
    clients: state.clients.filter((c) => c.userId === userId),
    projects: state.projects.filter((p) => p.userId === userId),
    timeEntries: state.timeEntries.filter((e) => e.userId === userId),
    invoices: state.invoices.filter((i) => i.userId === userId),
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const usingSupabase = isSupabaseConfigured();
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(() => emptyState());
  const [user, setUser] = useState<SessionUser | null>(null);
  const stateRef = useRef(state);

  const persist = useCallback(
    (next: AppState | ((prev: AppState) => AppState)) => {
      const resolved = healOrphanClients(
        typeof next === "function" ? next(stateRef.current) : next,
      );
      stateRef.current = resolved;
      setState(resolved);
      if (!usingSupabase) saveState(resolved);
    },
    [usingSupabase],
  );

  const sb = () => createBrowserSupabase();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (usingSupabase) {
        const supabase = createBrowserSupabase();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser && !cancelled) {
          const session = { id: authUser.id, email: authUser.email ?? "" };
          setUser(session);
          try {
            const cloud = await loadCloudData(supabase, session.id);
            const profile =
              cloud.profile ??
              defaultProfile(
                session.id,
                String(authUser.user_metadata?.name ?? ""),
                session.email,
              );
            if (!cancelled) {
              persist({
                users: [],
                profiles: [profile],
                clients: cloud.clients,
                projects: cloud.projects,
                timeEntries: cloud.timeEntries,
                invoices: cloud.invoices,
              });
              applyAppearance(profile.appearance);
            }
          } catch (e) {
            console.error(e);
            toast("Could not load cloud data. Check your Supabase schema.", "error");
          }
        }
        if (!cancelled) setReady(true);
        return;
      }
      const loaded = loadState();
      persist(loaded);
      const session = loadSession();
      setUser(session);
      const profile = session
        ? loaded.profiles.find((p) => p.id === session.id)
        : null;
      applyAppearance(profile?.appearance ?? "system");
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [persist, usingSupabase]);

  const slice = useMemo(
    () => (user ? userSlice(state, user.id) : userSlice(emptyState(), "")),
    [state, user],
  );

  const profile = slice.profile;
  const activeTimer =
    slice.timeEntries.find((e) => e.status === "running" || e.status === "paused") ??
    null;

  useEffect(() => {
    const mode = profile?.appearance ?? "system";
    applyAppearance(mode);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyAppearance(mode);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [profile?.appearance]);

  const requireUser = () => {
    if (!user) throw new Error("You must be signed in.");
    return user;
  };

  const signup = async (name: string, email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (usingSupabase) {
      const supabase = sb();
      const { data, error } = await supabase.auth.signUp({
        email: normalized,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Check your email to confirm the account.");
      const session = { id: data.user.id, email: normalized };
      setUser(session);
      const p = defaultProfile(session.id, name.trim(), normalized);
      persist({ ...emptyState(), profiles: [p] });
      await supabase.from("profiles").upsert({
        id: session.id,
        name: p.name,
        email: p.email,
        timezone: p.timezone,
        currency: p.currency,
        default_hourly_rate: p.defaultHourlyRate,
      });
      return;
    }
    if (state.users.some((u) => u.email === normalized)) {
      throw new Error("An account with that email already exists.");
    }
    const id = uid();
    const passwordHash = await hashPassword(password);
    const next: AppState = {
      ...state,
      users: [...state.users, { id, email: normalized, passwordHash }],
      profiles: [...state.profiles, defaultProfile(id, name.trim(), normalized)],
    };
    persist(next);
    const session = { id, email: normalized };
    setUser(session);
    saveSession(session);
  };

  const login = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (usingSupabase) {
      const supabase = sb();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error("Unable to sign in.");
      const session = { id: data.user.id, email: data.user.email ?? normalized };
      setUser(session);
      const cloud = await loadCloudData(supabase, session.id);
      const p =
        cloud.profile ??
        defaultProfile(session.id, String(data.user.user_metadata?.name ?? ""), session.email);
      persist({
        users: [],
        profiles: [p],
        clients: cloud.clients,
        projects: cloud.projects,
        timeEntries: cloud.timeEntries,
        invoices: cloud.invoices,
      });
      applyAppearance(p.appearance);
      return;
    }
    const found = state.users.find((u) => u.email === normalized);
    if (!found) throw new Error("Invalid email or password.");
    const passwordHash = await hashPassword(password);
    if (found.passwordHash !== passwordHash) throw new Error("Invalid email or password.");
    const session = { id: found.id, email: found.email };
    setUser(session);
    saveSession(session);
  };

  const loginWithGoogle = async () => {
    if (!usingSupabase) {
      throw new Error(
        "Google sign-in needs a Supabase project. Add your keys to .env.local, then enable Google under Authentication → Providers.",
      );
    }
    const { error } = await sb().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (usingSupabase) await sb().auth.signOut();
    setUser(null);
    saveSession(null);
  };

  const forgotPassword = async (email: string) => {
    if (usingSupabase) {
      const { error } = await sb().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
    }
  };

  const updateProfile = async (patch: Partial<Profile>) => {
    const u = requireUser();
    persist((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === u.id ? { ...p, ...patch } : p)),
      projects: patch.currency
        ? s.projects.map((p) => (p.userId === u.id ? { ...p, currency: patch.currency! } : p))
        : s.projects,
    }));
    if (patch.appearance) applyAppearance(patch.appearance);
    if (usingSupabase) {
      const { error } = await sb().from("profiles").update(profileToRow(patch)).eq("id", u.id);
      if (error) throw error;
      if (patch.currency) {
        const { error: projectError } = await sb()
          .from("projects")
          .update({ currency: patch.currency })
          .eq("user_id", u.id);
        if (projectError) throw projectError;
      }
    }
  };

  const skipOnboarding = async () => {
    await updateProfile({ onboardingCompleted: true });
  };

  const completeOnboarding = async (input: {
    profile: Partial<Profile>;
    projectName?: string;
    clientName?: string;
    hourlyRate: number;
    billingType: Project["billingType"];
  }) => {
    const u = requireUser();
    const projectName = input.projectName?.trim() ?? "";
    const clientName = input.clientName?.trim() ?? "";
    const shouldCreateProject = Boolean(projectName && clientName);

    const client: Client | null = shouldCreateProject
      ? {
          id: uid(),
          userId: u.id,
          name: clientName,
          company: "",
          email: "",
          phone: "",
          notes: "",
          createdAt: nowIso(),
        }
      : null;
    const project: Project | null =
      shouldCreateProject && client
        ? {
            id: uid(),
            userId: u.id,
            clientId: client.id,
            clientName,
            name: projectName,
            description: "",
            hourlyRate: input.hourlyRate,
            currency: input.profile.currency || profile?.currency || "USD",
            billingType: input.billingType,
            status: "active",
            startDate: nowIso().slice(0, 10),
            endDate: "",
            color: "#2563EB",
            createdAt: nowIso(),
          }
        : null;

    persist((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === u.id ? { ...p, ...input.profile, onboardingCompleted: true } : p,
      ),
      clients: client ? [...s.clients, client] : s.clients,
      projects: project ? [...s.projects, project] : s.projects,
    }));
    applyAppearance(input.profile.appearance ?? profile?.appearance ?? "system");
    if (usingSupabase) {
      const supabase = sb();
      await supabase.from("profiles").update(profileToRow({ ...input.profile, onboardingCompleted: true })).eq("id", u.id);
      if (client) await supabase.from("clients").insert(clientRow(client));
      if (project) await supabase.from("projects").insert(projectRow(project));
    }
  };

  const createClient = async (input: Omit<Client, "id" | "userId" | "createdAt">) => {
    const u = requireUser();
    const mine = userSlice(stateRef.current, u.id);
    assertCanCreate("clients", mine.clients.length, mine.profile?.plan);
    const client: Client = { ...input, id: uid(), userId: u.id, createdAt: nowIso() };
    persist((s) => ({ ...s, clients: [...s.clients, client] }));
    if (usingSupabase) {
      const { error } = await sb().from("clients").insert(clientRow(client));
      if (error) throw error;
    }
    return client;
  };

  const updateClient = async (id: string, patch: Partial<Client>) => {
    persist((s) => ({
      ...s,
      clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      projects: patch.name
        ? s.projects.map((p) => (p.clientId === id ? { ...p, clientName: patch.name } : p))
        : s.projects,
    }));
    if (usingSupabase) {
      const { error } = await sb()
        .from("clients")
        .update({
          name: patch.name,
          company: patch.company,
          email: patch.email,
          phone: patch.phone,
          notes: patch.notes,
        })
        .eq("id", id);
      if (error) throw error;
    }
  };

  const deleteClient = async (id: string) => {
    persist((s) => ({
      ...s,
      clients: s.clients.filter((c) => c.id !== id),
      projects: s.projects.filter((p) => p.clientId !== id),
      timeEntries: s.timeEntries.filter((e) => e.clientId !== id),
      invoices: s.invoices.filter((i) => i.clientId !== id),
    }));
    if (usingSupabase) {
      const { error } = await sb().from("clients").delete().eq("id", id);
      if (error) throw error;
    }
  };

  const createProject = async (
    input: Omit<Project, "id" | "userId" | "createdAt" | "clientName"> & {
      newClient?: Omit<Client, "id" | "userId" | "createdAt">;
    },
  ) => {
    const u = requireUser();
    const mine = userSlice(stateRef.current, u.id);
    assertCanCreate("projects", mine.projects.length, mine.profile?.plan);
    const { newClient: newClientInput, ...projectInput } = input;
    if (newClientInput) {
      assertCanCreate("clients", mine.clients.length, mine.profile?.plan);
    }
    const client: Client | null = newClientInput
      ? { ...newClientInput, id: uid(), userId: u.id, createdAt: nowIso() }
      : null;
    const clientName =
      client?.name ?? mine.clients.find((c) => c.id === projectInput.clientId)?.name ?? "";
    const project: Project = {
      ...projectInput,
      clientId: client?.id ?? projectInput.clientId,
      clientName,
      id: uid(),
      userId: u.id,
      createdAt: nowIso(),
    };
    persist((s) => ({
      ...s,
      clients: client ? [...s.clients, client] : s.clients,
      projects: [...s.projects, project],
    }));
    if (usingSupabase) {
      if (client) {
        const { error } = await sb().from("clients").insert(clientRow(client));
        if (error) throw error;
      }
      const { error } = await sb().from("projects").insert(projectRow(project));
      if (error) throw error;
    }
    return project;
  };

  const updateProject = async (id: string, patch: Partial<Project>) => {
    persist((s) => {
      const clientName = patch.clientId
        ? s.clients.find((c) => c.id === patch.clientId)?.name
        : undefined;
      return {
        ...s,
        projects: s.projects.map((p) =>
          p.id === id ? { ...p, ...patch, ...(clientName ? { clientName } : {}) } : p,
        ),
        timeEntries: patch.clientId
          ? s.timeEntries.map((e) => (e.projectId === id ? { ...e, clientId: patch.clientId! } : e))
          : s.timeEntries,
      };
    });
    if (usingSupabase) {
      const p = stateRef.current.projects.find((x) => x.id === id)!;
      const { error } = await sb().from("projects").update(projectRow(p)).eq("id", id);
      if (error) throw error;
    }
  };

  const archiveProject = async (id: string) => {
    await updateProject(id, { status: "archived" as ProjectStatus });
  };

  const deleteProject = async (id: string) => {
    persist((s) => ({
      ...s,
      projects: s.projects.filter((p) => p.id !== id),
      timeEntries: s.timeEntries.filter((e) => e.projectId !== id),
    }));
    if (usingSupabase) {
      const { error } = await sb().from("projects").delete().eq("id", id);
      if (error) throw error;
    }
  };

  const startTimer = async (input: {
    projectId: string;
    description: string;
    billable: boolean;
  }) => {
    const u = requireUser();
    const existing = state.timeEntries.find(
      (e) => e.userId === u.id && (e.status === "running" || e.status === "paused"),
    );
    if (existing) throw new Error("You already have an active timer. Stop or pause it first.");
    const project = state.projects.find((p) => p.id === input.projectId);
    if (!project) throw new Error("Select a project to start the timer.");
    if (!input.description.trim()) throw new Error("Add a task or description.");
    const p = state.profiles.find((x) => x.id === u.id)!;
    const rate = projectRateOrDefault(project, p);
    const entry: TimeEntry = {
      id: uid(),
      userId: u.id,
      projectId: project.id,
      clientId: project.clientId,
      description: input.description.trim(),
      startTime: nowIso(),
      endTime: null,
      duration: 0,
      billable: input.billable,
      hourlyRate: rate,
      earnings: 0,
      status: "running",
      createdAt: nowIso(),
    };
    persist((s) => ({ ...s, timeEntries: [entry, ...s.timeEntries] }));
    if (usingSupabase) {
      const { error } = await sb().from("time_entries").insert(entryRow(entry));
      if (error) throw error;
    }
  };

  const pauseTimer = async () => {
    const u = requireUser();
    const next = state.timeEntries.map((e) => {
      if (e.userId !== u.id || e.status !== "running") return e;
      const duration = liveDuration(e);
      return { ...e, duration, status: "paused" as const, endTime: nowIso() };
    });
    persist((s) => ({ ...s, timeEntries: next }));
    const paused = next.find((e) => e.userId === u.id && e.status === "paused");
    if (usingSupabase && paused) {
      await sb().from("time_entries").update(entryRow(paused)).eq("id", paused.id);
    }
  };

  const resumeTimer = async () => {
    const u = requireUser();
    const next = state.timeEntries.map((e) => {
      if (e.userId !== u.id || e.status !== "paused") return e;
      const resumedStart = new Date(Date.now() - e.duration * 1000).toISOString();
      return { ...e, status: "running" as const, startTime: resumedStart, endTime: null };
    });
    persist((s) => ({ ...s, timeEntries: next }));
    const running = next.find((e) => e.userId === u.id && e.status === "running");
    if (usingSupabase && running) {
      await sb().from("time_entries").update(entryRow(running)).eq("id", running.id);
    }
  };

  const stopTimer = async () => {
    const u = requireUser();
    const next = state.timeEntries.map((e) => {
      if (e.userId !== u.id || (e.status !== "running" && e.status !== "paused")) return e;
      return completeEntry(e, new Date(), liveDuration(e));
    });
    persist((s) => ({ ...s, timeEntries: next }));
    const done = next.find((e) => e.userId === u.id && e.id === activeTimer?.id);
    if (usingSupabase && done) {
      await sb().from("time_entries").update(entryRow(done)).eq("id", done.id);
    }
  };

  const addManualEntry = async (input: ManualEntryInput) => {
    const u = requireUser();
    const project = state.projects.find((p) => p.id === input.projectId);
    if (!project) throw new Error("Select a project.");
    const entry = buildManualEntry({
      userId: u.id,
      project: {
        ...project,
        hourlyRate: projectRateOrDefault(project, state.profiles.find((p) => p.id === u.id)!),
      },
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      description: input.description,
      billable: input.billable,
    });
    if (entry.duration <= 0) throw new Error("End time must be after start time.");
    persist((s) => ({ ...s, timeEntries: [entry, ...s.timeEntries] }));
    if (usingSupabase) {
      const { error } = await sb().from("time_entries").insert(entryRow(entry));
      if (error) throw error;
    }
  };

  const updateEntry = async (id: string, patch: Partial<TimeEntry>) => {
    const next = state.timeEntries.map((e) => {
      if (e.id !== id) return e;
      const merged = { ...e, ...patch };
      if (merged.status === "completed") {
        merged.earnings = earningsFromDuration(merged.billable, merged.duration, merged.hourlyRate);
      }
      return merged;
    });
    persist((s) => ({ ...s, timeEntries: next }));
    const entry = next.find((e) => e.id === id);
    if (usingSupabase && entry) {
      const { error } = await sb().from("time_entries").update(entryRow(entry)).eq("id", id);
      if (error) throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    persist((s) => ({ ...s, timeEntries: s.timeEntries.filter((e) => e.id !== id) }));
    if (usingSupabase) await sb().from("time_entries").delete().eq("id", id);
  };

  const duplicateEntry = async (id: string) => {
    const entry = state.timeEntries.find((e) => e.id === id);
    if (!entry) return;
    const copy: TimeEntry = { ...entry, id: uid(), createdAt: nowIso(), status: "completed" };
    persist((s) => ({ ...s, timeEntries: [copy, ...s.timeEntries] }));
    if (usingSupabase) await sb().from("time_entries").insert(entryRow(copy));
  };

  const createInvoice = async (input: {
    clientId: string;
    invoiceNumber?: string;
    issueDate: string;
    dueDate: string;
    items: Omit<InvoiceItem, "id" | "invoiceId">[];
    discount: number;
    tax: number;
    notes?: string;
  }) => {
    const u = requireUser();
    const mine = userSlice(state, u.id);
    assertCanCreate("invoices", mine.invoices.length, mine.profile?.plan);
    const id = uid();
    const invoice = recalcInvoice({
      id,
      userId: u.id,
      clientId: input.clientId,
      invoiceNumber: input.invoiceNumber || nextInvoiceNumber(slice.invoices),
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      status: "draft",
      subtotal: 0,
      discount: input.discount,
      tax: input.tax,
      total: 0,
      notes: input.notes ?? "",
      createdAt: nowIso(),
      items: input.items.map((item) => ({ ...item, id: uid(), invoiceId: id })),
    });
    persist((s) => ({ ...s, invoices: [invoice, ...s.invoices] }));
    if (usingSupabase) {
      const supabase = sb();
      await supabase.from("invoices").insert(invoiceRow(invoice));
      if (invoice.items.length) {
        await supabase.from("invoice_items").insert(invoice.items.map(itemRow));
      }
    }
    return invoice;
  };

  const updateInvoice = async (id: string, patch: Partial<Invoice>) => {
    const next = state.invoices.map((inv) => (inv.id === id ? recalcInvoice({ ...inv, ...patch }) : inv));
    persist((s) => ({ ...s, invoices: next }));
    const inv = next.find((i) => i.id === id);
    if (usingSupabase && inv) {
      const supabase = sb();
      await supabase.from("invoices").update(invoiceRow(inv)).eq("id", id);
      await supabase.from("invoice_items").delete().eq("invoice_id", id);
      if (inv.items.length) await supabase.from("invoice_items").insert(inv.items.map(itemRow));
    }
  };

  const setInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    await updateInvoice(id, { status });
  };

  const deleteInvoice = async (id: string) => {
    persist((s) => ({ ...s, invoices: s.invoices.filter((i) => i.id !== id) }));
    if (usingSupabase) await sb().from("invoices").delete().eq("id", id);
  };

  const changePassword = async (current: string, next: string) => {
    const u = requireUser();
    if (usingSupabase) {
      const { error } = await sb().auth.updateUser({ password: next });
      if (error) throw error;
      return;
    }
    const hash = await hashPassword(current);
    const found = state.users.find((x) => x.id === u.id);
    if (!found || found.passwordHash !== hash) throw new Error("Current password is incorrect.");
    const nextHash = await hashPassword(next);
    persist((s) => ({
      ...s,
      users: s.users.map((x) => (x.id === u.id ? { ...x, passwordHash: nextHash } : x)),
    }));
  };

  const deleteAccount = async () => {
    const u = requireUser();
    if (usingSupabase) {
      toast("Cloud account deletion is disabled in the client. Local session will be signed out.", "warning");
      await sb().auth.signOut();
    }
    persist({
      users: state.users.filter((x) => x.id !== u.id),
      profiles: state.profiles.filter((x) => x.id !== u.id),
      clients: state.clients.filter((x) => x.userId !== u.id),
      projects: state.projects.filter((x) => x.userId !== u.id),
      timeEntries: state.timeEntries.filter((x) => x.userId !== u.id),
      invoices: state.invoices.filter((x) => x.userId !== u.id),
    });
    setUser(null);
    saveSession(null);
  };

  const changePlan = async (plan: PlanId, interval: PlanInterval) => {
    await updateProfile({
      plan,
      planInterval: interval,
      planStatus: "active",
      planRenewsAt: plan === "free" ? null : renewsOn(new Date(), interval),
    });
  };

  const value: Store = {
    ready,
    usingSupabase,
    user,
    profile,
    clients: slice.clients,
    projects: slice.projects,
    timeEntries: slice.timeEntries,
    invoices: slice.invoices,
    activeTimer,
    signup,
    login,
    loginWithGoogle,
    logout,
    forgotPassword,
    updateProfile,
    completeOnboarding,
    skipOnboarding,
    createClient,
    updateClient,
    deleteClient,
    createProject,
    updateProject,
    archiveProject,
    deleteProject,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addManualEntry,
    updateEntry,
    deleteEntry,
    duplicateEntry,
    createInvoice,
    updateInvoice,
    setInvoiceStatus,
    deleteInvoice,
    changePassword,
    deleteAccount,
    changePlan,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
