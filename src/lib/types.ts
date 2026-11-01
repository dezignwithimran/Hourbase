export type Appearance = "light" | "dark" | "system";
export type PlanId = "free" | "pro" | "studio";
export type PlanInterval = "monthly" | "yearly";
export type PlanStatus = "active" | "canceled";
export type TeamRole = "admin" | "collaborator";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type ProjectStatus = "active" | "paused" | "completed" | "archived";
export type BillingType = "hourly" | "fixed";
export type TimerStatus = "idle" | "running" | "paused" | "completed";
export type EntryStatus = "running" | "paused" | "completed";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  company: string;
  bio: string;
  country: string;
  timezone: string;
  currency: string;
  defaultHourlyRate: number;
  workingHoursPerDay: number;
  appearance: Appearance;
  notifyTimerReminders: boolean;
  notifyWeeklySummary: boolean;
  notifyInvoiceReminders: boolean;
  onboardingCompleted: boolean;
  plan: PlanId;
  planInterval: PlanInterval;
  planStatus: PlanStatus;
  planRenewsAt: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  paddleCustomerId?: string | null;
  paddleSubscriptionId?: string | null;
  teamMembers: TeamMember[];
  supportTickets: SupportTicket[];
  createdAt: string;
};

export type Client = {
  id: string;
  userId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
};

export type Project = {
  id: string;
  userId: string;
  clientId: string;
  /** Kept on the project so the name still displays if the client record is missing. */
  clientName?: string;
  name: string;
  description: string;
  hourlyRate: number;
  currency: string;
  billingType: BillingType;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  color: string;
  createdAt: string;
};

export type Task = {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  done: boolean;
  createdAt: string;
};

export type TimeEntry = {
  id: string;
  userId: string;
  projectId: string;
  clientId: string;
  description: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  billable: boolean;
  hourlyRate: number;
  earnings: number;
  status: EntryStatus;
  createdAt: string;
};

export type InvoiceItem = {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type Invoice = {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string;
  createdAt: string;
  items: InvoiceItem[];
};

export type SessionUser = {
  id: string;
  email: string;
};
