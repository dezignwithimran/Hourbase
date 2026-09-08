import type { PlanId, PlanInterval, PlanStatus } from "@/lib/types";

export type { PlanId, PlanInterval, PlanStatus };
export type PlanFeature = "projects" | "clients" | "invoices";

export type PlanLimits = {
  projects: number | null;
  clients: number | null;
  invoices: number | null;
};

export type PlanBullet = {
  label: string;
  pro?: boolean;
};

export type Plan = {
  id: PlanId;
  name: string;
  monthly: number;
  yearly: number;
  blurb: string;
  features: PlanBullet[];
  limits: PlanLimits;
  popular?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    blurb: "Start tracking with a small client list.",
    features: [
      { label: "3 projects" },
      { label: "3 clients" },
      { label: "5 invoices" },
      { label: "Unlimited time tracking" },
      { label: "Timesheets, reports, and PDFs" },
    ],
    limits: { projects: 3, clients: 3, invoices: 5 },
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 12,
    yearly: 108,
    blurb: "Unlimited workspace for working freelancers.",
    features: [
      { label: "Unlimited projects", pro: true },
      { label: "Unlimited clients", pro: true },
      { label: "Unlimited invoices", pro: true },
      { label: "Team workspace", pro: true },
      { label: "Priority support", pro: true },
      { label: "Everything on Free" },
    ],
    limits: { projects: null, clients: null, invoices: null },
    popular: true,
  },
  {
    id: "studio",
    name: "Studio",
    monthly: 29,
    yearly: 276,
    blurb: "Room to grow when invoicing becomes a core workflow.",
    features: [
      { label: "Everything on Pro", pro: true },
      { label: "Team workspace", pro: true },
      { label: "Priority support", pro: true },
      { label: "Unlimited projects, clients, and invoices", pro: true },
    ],
    limits: { projects: null, clients: null, invoices: null },
  },
];

export class PlanLimitError extends Error {
  feature: PlanFeature;
  limit: number;

  constructor(feature: PlanFeature, limit: number) {
    super(
      `The Free plan includes ${limit} ${feature}. Upgrade to Pro for unlimited ${feature}.`,
    );
    this.name = "PlanLimitError";
    this.feature = feature;
    this.limit = limit;
  }
}

export function isPlanId(value: unknown): value is PlanId {
  return value === "free" || value === "pro" || value === "studio";
}

export function isPlanInterval(value: unknown): value is PlanInterval {
  return value === "monthly" || value === "yearly";
}

export function getPlan(id?: PlanId | null): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function planPrice(plan: Plan, interval: PlanInterval) {
  if (plan.id === "free") return 0;
  return interval === "yearly" ? plan.yearly : plan.monthly;
}

export function planPriceLabel(plan: Plan, interval: PlanInterval) {
  const amount = planPrice(plan, interval);
  if (amount === 0) return "$0";
  if (interval === "yearly") return `$${amount}/year`;
  return `$${amount}/month`;
}

export function yearlyMonthlyEquivalent(plan: Plan) {
  return Math.round((plan.yearly / 12) * 100) / 100;
}

export function isPaidPlan(id?: PlanId | null) {
  return id === "pro" || id === "studio";
}

export function usage(
  feature: PlanFeature,
  count: number,
  planId?: PlanId | null,
) {
  const limit = getPlan(planId).limits[feature];
  const remaining = limit == null ? null : Math.max(0, limit - count);
  return {
    count,
    limit,
    remaining,
    atLimit: limit != null && count >= limit,
    label: limit == null ? `${count} ${feature}` : `${count} of ${limit} ${feature}`,
  };
}

export function canCreate(
  feature: PlanFeature,
  count: number,
  planId?: PlanId | null,
) {
  return !usage(feature, count, planId).atLimit;
}

export function assertCanCreate(
  feature: PlanFeature,
  count: number,
  planId?: PlanId | null,
) {
  const current = usage(feature, count, planId);
  if (current.atLimit && current.limit != null) {
    throw new PlanLimitError(feature, current.limit);
  }
}

export function renewsOn(from = new Date(), interval: PlanInterval) {
  const next = new Date(from);
  if (interval === "yearly") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next.toISOString();
}

export function formatRenewsAt(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
