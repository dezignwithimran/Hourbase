import { NextResponse } from "next/server";
import { profileToRow } from "@/lib/store/supabase-io";
import {
  patchFromSubscription,
  stripeRequest,
  verifyStripeWebhook,
  type StripeCheckoutSession,
  type StripeSubscription,
} from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/admin";

type StripeEvent = {
  type: string;
  data: { object: StripeSubscription | StripeCheckoutSession };
};

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ received: true, skipped: true });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const payload = await request.text();
  try {
    verifyStripeWebhook(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createServiceClient();
  if (!admin) return NextResponse.json({ received: true, skipped: true });

  const event = JSON.parse(payload) as StripeEvent;
  const apply = async (sub: StripeSubscription) => {
    const userId = sub.metadata.userId;
    if (!userId) return;
    await admin.from("profiles").update(profileToRow(patchFromSubscription(sub))).eq("id", userId);
  };

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await apply(event.data.object as StripeSubscription);
      break;
    case "checkout.session.completed": {
      const session = event.data.object as StripeCheckoutSession;
      if (session.mode !== "subscription" || !session.subscription) break;
      const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      const sub = await stripeRequest<StripeSubscription>("GET", `/v1/subscriptions/${id}`);
      await apply(sub);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
