import { NextResponse } from "next/server";
import { profileToRow } from "@/lib/store/supabase-io";
import {
  isStripeConfigured,
  patchFromSubscription,
  planFromMetadata,
  stripeRequest,
  type PlanPatch,
  type StripeCheckoutSession,
  type StripeSubscription,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

async function writePlan(userId: string, patch: PlanPatch) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(profileToRow(patch)).eq("id", userId);
  if (error) throw error;
  return patch;
}

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json({ configured: false });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { sessionId?: string };

  if (body.sessionId) {
    const session = await stripeRequest<StripeCheckoutSession>(
      "GET",
      `/v1/checkout/sessions/${body.sessionId}`,
      { "expand[]": "subscription" },
    );
    if (session.client_reference_id !== user.id) {
      return NextResponse.json({ error: "This checkout belongs to another account." }, { status: 403 });
    }
    const sub = session.subscription;
    if (typeof sub === "object" && sub) {
      const patch = patchFromSubscription(sub);
      await writePlan(user.id, patch);
      return NextResponse.json(patch);
    }
    const meta = planFromMetadata(session.metadata);
    if (meta && session.payment_status === "paid") {
      const patch: PlanPatch = {
        plan: meta.plan,
        planInterval: meta.interval,
        planStatus: "active",
        planRenewsAt: null,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
        stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
      };
      await writePlan(user.id, patch);
      return NextResponse.json(patch);
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ plan: "free" });
  }

  const subs = await stripeRequest<{ data: StripeSubscription[] }>("GET", "/v1/subscriptions", {
    customer: profile.stripe_customer_id,
    status: "all",
    limit: "5",
  });
  const current =
    subs.data.find((s) => s.status === "active" || s.status === "trialing") ?? subs.data[0];
  if (!current) {
    const patch: PlanPatch = {
      plan: "free",
      planInterval: "monthly",
      planStatus: "active",
      planRenewsAt: null,
      stripeCustomerId: profile.stripe_customer_id,
      stripeSubscriptionId: null,
    };
    await writePlan(user.id, patch);
    return NextResponse.json(patch);
  }
  const patch = patchFromSubscription(current);
  await writePlan(user.id, patch);
  return NextResponse.json(patch);
}
