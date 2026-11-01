import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeProfile } from "@/lib/store/helpers";
import type { Client, Invoice, InvoiceItem, Profile, Project, Task, TimeEntry } from "@/lib/types";

function n(v: unknown): number {
  return Number(v ?? 0);
}

export function mapProfile(row: Record<string, unknown>): Profile {
  return normalizeProfile({
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    avatar: String(row.avatar ?? ""),
    company: String(row.company ?? ""),
    bio: String(row.bio ?? ""),
    country: String(row.country ?? ""),
    timezone: String(row.timezone ?? "UTC"),
    currency: String(row.currency ?? "USD"),
    defaultHourlyRate: n(row.default_hourly_rate),
    workingHoursPerDay: n(row.working_hours_per_day),
    appearance: (row.appearance as Profile["appearance"]) ?? "system",
    notifyTimerReminders: Boolean(row.notify_timer_reminders),
    notifyWeeklySummary: Boolean(row.notify_weekly_summary),
    notifyInvoiceReminders: Boolean(row.notify_invoice_reminders),
    onboardingCompleted: Boolean(row.onboarding_completed),
    plan: (row.plan as Profile["plan"]) ?? "free",
    planInterval: (row.plan_interval as Profile["planInterval"]) ?? "monthly",
    planStatus: (row.plan_status as Profile["planStatus"]) ?? "active",
    planRenewsAt: row.plan_renews_at ? String(row.plan_renews_at) : null,
    stripeCustomerId: row.stripe_customer_id ? String(row.stripe_customer_id) : null,
    stripeSubscriptionId: row.stripe_subscription_id ? String(row.stripe_subscription_id) : null,
    paddleCustomerId: row.paddle_customer_id ? String(row.paddle_customer_id) : null,
    paddleSubscriptionId: row.paddle_subscription_id ? String(row.paddle_subscription_id) : null,
    teamMembers: (row.team_members as Profile["teamMembers"]) ?? [],
    supportTickets: (row.support_tickets as Profile["supportTickets"]) ?? [],
    createdAt: String(row.created_at),
  });
}

export function profileToRow(p: Partial<Profile>) {
  const row: Record<string, unknown> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.email !== undefined) row.email = p.email;
  if (p.avatar !== undefined) row.avatar = p.avatar;
  if (p.company !== undefined) row.company = p.company;
  if (p.bio !== undefined) row.bio = p.bio;
  if (p.country !== undefined) row.country = p.country;
  if (p.timezone !== undefined) row.timezone = p.timezone;
  if (p.currency !== undefined) row.currency = p.currency;
  if (p.defaultHourlyRate !== undefined) row.default_hourly_rate = p.defaultHourlyRate;
  if (p.workingHoursPerDay !== undefined) row.working_hours_per_day = p.workingHoursPerDay;
  if (p.appearance !== undefined) row.appearance = p.appearance;
  if (p.notifyTimerReminders !== undefined) row.notify_timer_reminders = p.notifyTimerReminders;
  if (p.notifyWeeklySummary !== undefined) row.notify_weekly_summary = p.notifyWeeklySummary;
  if (p.notifyInvoiceReminders !== undefined) row.notify_invoice_reminders = p.notifyInvoiceReminders;
  if (p.onboardingCompleted !== undefined) row.onboarding_completed = p.onboardingCompleted;
  if (p.plan !== undefined) row.plan = p.plan;
  if (p.planInterval !== undefined) row.plan_interval = p.planInterval;
  if (p.planStatus !== undefined) row.plan_status = p.planStatus;
  if (p.planRenewsAt !== undefined) row.plan_renews_at = p.planRenewsAt;
  if (p.stripeCustomerId !== undefined) row.stripe_customer_id = p.stripeCustomerId;
  if (p.stripeSubscriptionId !== undefined) row.stripe_subscription_id = p.stripeSubscriptionId;
  if (p.paddleCustomerId !== undefined) row.paddle_customer_id = p.paddleCustomerId;
  if (p.paddleSubscriptionId !== undefined) row.paddle_subscription_id = p.paddleSubscriptionId;
  if (p.teamMembers !== undefined) row.team_members = p.teamMembers;
  if (p.supportTickets !== undefined) row.support_tickets = p.supportTickets;
  row.updated_at = new Date().toISOString();
  return row;
}

export function mapClient(row: Record<string, unknown>): Client {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    company: String(row.company ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at),
  };
}

export function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    clientId: String(row.client_id),
    name: String(row.name),
    description: String(row.description ?? ""),
    hourlyRate: n(row.hourly_rate),
    currency: String(row.currency ?? "USD"),
    billingType: (row.billing_type as Project["billingType"]) ?? "hourly",
    status: (row.status as Project["status"]) ?? "active",
    startDate: String(row.start_date ?? ""),
    endDate: String(row.end_date ?? ""),
    color: String(row.color ?? "#2563EB"),
    createdAt: String(row.created_at),
  };
}

export function mapTask(row: Record<string, unknown>): Task {
  const status = String(row.status ?? "");
  return {
    id: String(row.id),
    userId: String(row.user_id),
    projectId: String(row.project_id),
    title: String(row.title ?? ""),
    status:
      status === "in_progress" || status === "completed" || status === "todo"
        ? status
        : row.done
          ? "completed"
          : "todo",
    dueDate: row.due_date ? String(row.due_date).slice(0, 10) : null,
    createdAt: String(row.created_at),
  };
}

export function mapEntry(row: Record<string, unknown>): TimeEntry {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    projectId: String(row.project_id),
    clientId: String(row.client_id),
    taskId: row.task_id ? String(row.task_id) : null,
    description: String(row.description ?? ""),
    startTime: String(row.start_time),
    endTime: row.end_time ? String(row.end_time) : null,
    duration: n(row.duration),
    billable: Boolean(row.billable),
    hourlyRate: n(row.hourly_rate),
    earnings: n(row.earnings),
    status: (row.status as TimeEntry["status"]) ?? "completed",
    createdAt: String(row.created_at),
  };
}

export function mapInvoice(row: Record<string, unknown>, items: InvoiceItem[]): Invoice {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    clientId: String(row.client_id),
    invoiceNumber: String(row.invoice_number),
    issueDate: String(row.issue_date),
    dueDate: String(row.due_date),
    status: (row.status as Invoice["status"]) ?? "draft",
    subtotal: n(row.subtotal),
    discount: n(row.discount),
    tax: n(row.tax),
    total: n(row.total),
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at),
    items,
  };
}

export function mapItem(row: Record<string, unknown>): InvoiceItem {
  return {
    id: String(row.id),
    invoiceId: String(row.invoice_id),
    description: String(row.description),
    quantity: n(row.quantity),
    rate: n(row.rate),
    amount: n(row.amount),
  };
}

export async function loadCloudData(supabase: SupabaseClient, userId: string) {
  const [profileRes, clientsRes, projectsRes, entriesRes, invoicesRes, itemsRes, tasksRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("clients").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("projects").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("time_entries").select("*").eq("user_id", userId).order("start_time", { ascending: false }),
      supabase.from("invoices").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("invoice_items").select("*"),
      supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

  const tasksMissing = isMissingTable(tasksRes.error);
  const err =
    profileRes.error ||
    clientsRes.error ||
    projectsRes.error ||
    entriesRes.error ||
    invoicesRes.error ||
    itemsRes.error ||
    (tasksRes.error && !tasksMissing ? tasksRes.error : null);
  if (err) throw err;

  const items = (itemsRes.data ?? []).map((r) => mapItem(r as Record<string, unknown>));
  const invoices = (invoicesRes.data ?? []).map((inv) =>
    mapInvoice(
      inv as Record<string, unknown>,
      items.filter((i) => i.invoiceId === (inv as { id: string }).id),
    ),
  );

  return {
    profile: profileRes.data ? mapProfile(profileRes.data as Record<string, unknown>) : null,
    clients: (clientsRes.data ?? []).map((r) => mapClient(r as Record<string, unknown>)),
    projects: (projectsRes.data ?? []).map((r) => mapProject(r as Record<string, unknown>)),
    timeEntries: (entriesRes.data ?? []).map((r) => mapEntry(r as Record<string, unknown>)),
    invoices,
    tasks:
      tasksRes.error || !tasksRes.data
        ? []
        : tasksRes.data.map((r) => mapTask(r as Record<string, unknown>)),
  };
}

function isMissingTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return /PGRST205|42P01|schema cache|does not exist/i.test(`${error.code ?? ""} ${error.message ?? ""}`);
}

export function clientRow(c: Client) {
  return {
    id: c.id,
    user_id: c.userId,
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    notes: c.notes,
    created_at: c.createdAt,
  };
}

export function projectRow(p: Project) {
  return {
    id: p.id,
    user_id: p.userId,
    client_id: p.clientId,
    name: p.name,
    description: p.description,
    hourly_rate: p.hourlyRate,
    currency: p.currency,
    billing_type: p.billingType,
    status: p.status,
    start_date: p.startDate || null,
    end_date: p.endDate || null,
    color: p.color,
    created_at: p.createdAt,
  };
}

export function taskRow(t: Task) {
  return {
    id: t.id,
    user_id: t.userId,
    project_id: t.projectId,
    title: t.title,
    done: t.status === "completed",
    status: t.status,
    due_date: t.dueDate || null,
    created_at: t.createdAt,
  };
}

export function entryRow(e: TimeEntry) {
  return {
    id: e.id,
    user_id: e.userId,
    project_id: e.projectId,
    client_id: e.clientId,
    ...(e.taskId ? { task_id: e.taskId } : {}),
    description: e.description,
    start_time: e.startTime,
    end_time: e.endTime,
    duration: e.duration,
    billable: e.billable,
    hourly_rate: e.hourlyRate,
    earnings: e.earnings,
    status: e.status,
    created_at: e.createdAt,
  };
}

export function invoiceRow(i: Invoice) {
  return {
    id: i.id,
    user_id: i.userId,
    client_id: i.clientId,
    invoice_number: i.invoiceNumber,
    issue_date: i.issueDate,
    due_date: i.dueDate,
    status: i.status,
    subtotal: i.subtotal,
    discount: i.discount,
    tax: i.tax,
    total: i.total,
    notes: i.notes,
    created_at: i.createdAt,
  };
}

export function itemRow(item: InvoiceItem) {
  return {
    id: item.id,
    invoice_id: item.invoiceId,
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    amount: item.amount,
  };
}
