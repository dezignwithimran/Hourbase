import { NextResponse } from "next/server";
import { isStripeConfigured, stripeRequest } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Billing portal is not available." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No payment method on file yet." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const session = await stripeRequest<{ url?: string }>("POST", "/v1/billing_portal/sessions", {
    customer: profile.stripe_customer_id,
    return_url: `${origin}/billing?checkout=portal`,
  });
  return NextResponse.json({ url: session.url });
}
