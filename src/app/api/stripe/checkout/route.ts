import { NextResponse } from "next/server";
import { getPlan, isPaidPlan, isPlanId, isPlanInterval } from "@/lib/billing";
import { isStripeConfigured, planAmountCents, stripeRequest } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 400 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Sign in with a cloud account to pay." }, { status: 400 });
  }

  const body = (await request.json()) as { plan?: string; interval?: string };
  if (!isPlanId(body.plan) || !isPaidPlan(body.plan) || !isPlanInterval(body.interval)) {
    return NextResponse.json({ error: "Choose Pro or Studio." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const origin = new URL(request.url).origin;
  const plan = getPlan(body.plan);
  const params: Record<string, string> = {
    mode: "subscription",
    client_reference_id: user.id,
    success_url: `${origin}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/billing?checkout=canceled`,
    "metadata[userId]": user.id,
    "metadata[plan]": body.plan,
    "metadata[interval]": body.interval,
    "subscription_data[metadata][userId]": user.id,
    "subscription_data[metadata][plan]": body.plan,
    "subscription_data[metadata][interval]": body.interval,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(planAmountCents(body.plan, body.interval)),
    "line_items[0][price_data][recurring][interval]": body.interval === "yearly" ? "year" : "month",
    "line_items[0][price_data][product_data][name]": `Hourbase ${plan.name}`,
    "line_items[0][price_data][product_data][description]": plan.blurb,
  };
  if (profile?.stripe_customer_id) params.customer = profile.stripe_customer_id;
  else params.customer_email = user.email;

  const session = await stripeRequest<{ url?: string }>("POST", "/v1/checkout/sessions", params);
  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
  return NextResponse.json({ url: session.url });
}
