import { createHmac, timingSafeEqual } from "crypto";
import { isPlanId, isPlanInterval } from "@/lib/billing";
import type { PlanId, PlanInterval, PlanStatus } from "@/lib/types";

export function isPaddleConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
      paddlePriceId("pro", "monthly") &&
      paddlePriceId("pro", "yearly"),
  );
}

export function paddlePriceId(plan: PlanId, interval: PlanInterval) {
  const key =
    plan === "studio"
      ? interval === "yearly"
        ? "NEXT_PUBLIC_PADDLE_PRICE_STUDIO_YEARLY"
        : "NEXT_PUBLIC_PADDLE_PRICE_STUDIO_MONTHLY"
      : interval === "yearly"
        ? "NEXT_PUBLIC_PADDLE_PRICE_PRO_YEARLY"
        : "NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY";
  return process.env[key] || "";
}

export function planFromPaddlePrice(priceId: string | undefined): {
  plan: PlanId;
  interval: PlanInterval;
} | null {
  if (!priceId) return null;
  const map: Array<{ plan: PlanId; interval: PlanInterval }> = [
    { plan: "pro", interval: "monthly" },
    { plan: "pro", interval: "yearly" },
    { plan: "studio", interval: "monthly" },
    { plan: "studio", interval: "yearly" },
  ];
  return map.find((row) => paddlePriceId(row.plan, row.interval) === priceId) ?? null;
}

export type PlanPatch = {
  plan: PlanId;
  planInterval: PlanInterval;
  planStatus: PlanStatus;
  planRenewsAt: string | null;
  paddleCustomerId?: string | null;
  paddleSubscriptionId?: string | null;
};

type PaddleCustomData = Record<string, string | undefined>;

export function planFromCustomData(data: PaddleCustomData | null | undefined) {
  const plan = data?.plan;
  const interval = data?.interval;
  if (!isPlanId(plan) || plan === "free" || !isPlanInterval(interval)) return null;
  return { plan, interval };
}

export function patchFromPaddleSubscription(sub: {
  id: string;
  status: string;
  customer_id?: string;
  current_billing_period?: { ends_at?: string | null } | null;
  custom_data?: PaddleCustomData | null;
  items?: Array<{ price?: { id?: string } }>;
}): PlanPatch {
  const fromData = planFromCustomData(sub.custom_data);
  const fromPrice = planFromPaddlePrice(sub.items?.[0]?.price?.id);
  const mapped = fromData ?? fromPrice;
  const active = sub.status === "active" || sub.status === "trialing";
  if (!active || !mapped) {
    return {
      plan: "free",
      planInterval: "monthly",
      planStatus: sub.status === "canceled" ? "canceled" : "active",
      planRenewsAt: null,
      paddleCustomerId: sub.customer_id ?? null,
      paddleSubscriptionId: sub.id,
    };
  }
  return {
    plan: mapped.plan,
    planInterval: mapped.interval,
    planStatus: "active",
    planRenewsAt: sub.current_billing_period?.ends_at ?? null,
    paddleCustomerId: sub.customer_id ?? null,
    paddleSubscriptionId: sub.id,
  };
}

export function verifyPaddleWebhook(payload: string, header: string, secret: string) {
  const parts = Object.fromEntries(
    header.split(";").map((part) => {
      const [k, ...rest] = part.split("=");
      return [k.trim(), rest.join("=")];
    }),
  );
  const timestamp = parts.ts;
  const signature = parts.h1;
  if (!timestamp || !signature) throw new Error("Invalid Paddle signature.");
  const expected = createHmac("sha256", secret).update(`${timestamp}:${payload}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid Paddle signature.");
  }
}

function paddleApiBase() {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

export async function paddleRequest<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error("Paddle API key is missing.");
  const res = await fetch(`${paddleApiBase()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json()) as T & { error?: { detail?: string } };
  if (!res.ok) throw new Error(json.error?.detail || "Paddle request failed.");
  return json;
}
