import { NextResponse } from "next/server";
import { profileToRow } from "@/lib/store/supabase-io";
import { paddleRequest, patchFromPaddleSubscription, verifyPaddleWebhook } from "@/lib/paddle";
import { createServiceClient } from "@/lib/supabase/admin";

type PaddleEvent = {
  event_type?: string;
  data?: {
    id?: string;
    status?: string;
    customer_id?: string;
    custom_data?: Record<string, string>;
    current_billing_period?: { ends_at?: string | null } | null;
    items?: Array<{ price?: { id?: string } }>;
    subscription_id?: string | null;
  };
};

type PaddleSub = {
  id: string;
  status: string;
  customer_id?: string;
  custom_data?: Record<string, string>;
  current_billing_period?: { ends_at?: string | null } | null;
  items?: Array<{ price?: { id?: string } }>;
};

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ received: true, skipped: true });

  const payload = await request.text();
  const header = request.headers.get("paddle-signature");
  if (!header) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  try {
    verifyPaddleWebhook(payload, header, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createServiceClient();
  if (!admin) return NextResponse.json({ received: true, skipped: true });

  const event = JSON.parse(payload) as PaddleEvent;
  let subPayload = event.event_type?.startsWith("subscription.") ? event.data : null;
  if (!subPayload && event.data?.subscription_id) {
    try {
      const subRes = await paddleRequest<{ data: PaddleSub }>(
        "GET",
        `/subscriptions/${event.data.subscription_id}`,
      );
      subPayload = subRes.data;
    } catch {
      subPayload = {
        ...event.data,
        id: event.data.subscription_id,
        status: event.data.status === "completed" || event.data.status === "paid" ? "active" : event.data.status,
      };
    }
  }
  if (!subPayload?.id || !subPayload.status) return NextResponse.json({ received: true });

  const customData = subPayload.custom_data ?? event.data?.custom_data;
  const userId = customData?.userId;
  if (!userId) return NextResponse.json({ received: true });

  const patch = patchFromPaddleSubscription({
    id: subPayload.id,
    status: subPayload.status,
    customer_id: subPayload.customer_id ?? event.data?.customer_id,
    custom_data: customData,
    current_billing_period: subPayload.current_billing_period,
    items: subPayload.items ?? event.data?.items,
  });
  await admin.from("profiles").update(profileToRow(patch)).eq("id", userId);
  return NextResponse.json({ received: true });
}
