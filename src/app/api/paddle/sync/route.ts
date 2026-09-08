import { NextResponse } from "next/server";
import { isPaddleConfigured, paddleRequest, patchFromPaddleSubscription } from "@/lib/paddle";
import { profileToRow } from "@/lib/store/supabase-io";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type PaddleTx = {
  id: string;
  status?: string;
  customer_id?: string;
  subscription_id?: string | null;
  custom_data?: Record<string, string>;
  items?: Array<{ price?: { id?: string } }>;
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
  if (!isPaddleConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Paddle is not configured." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { transactionId?: string };
  if (!body.transactionId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, plan_interval, plan_status, plan_renews_at, paddle_customer_id, paddle_subscription_id")
      .eq("id", user.id)
      .maybeSingle();
    return NextResponse.json({
      plan: profile?.plan ?? "free",
      planInterval: profile?.plan_interval ?? "monthly",
      planStatus: profile?.plan_status ?? "active",
      planRenewsAt: profile?.plan_renews_at ?? null,
      paddleCustomerId: profile?.paddle_customer_id ?? null,
      paddleSubscriptionId: profile?.paddle_subscription_id ?? null,
    });
  }

  const txRes = await paddleRequest<{ data: PaddleTx }>("GET", `/transactions/${body.transactionId}`);
  const tx = txRes.data;
  const customUser = tx.custom_data?.userId;
  if (customUser && customUser !== user.id) {
    return NextResponse.json({ error: "This checkout belongs to another account." }, { status: 403 });
  }

  let sub: PaddleSub | null = null;
  if (tx.subscription_id) {
    const subRes = await paddleRequest<{ data: PaddleSub }>("GET", `/subscriptions/${tx.subscription_id}`);
    sub = subRes.data;
  }

  const patch = sub
    ? patchFromPaddleSubscription(sub)
    : patchFromPaddleSubscription({
        id: tx.subscription_id || tx.id,
        status: tx.status === "completed" || tx.status === "paid" ? "active" : tx.status || "active",
        customer_id: tx.customer_id,
        custom_data: tx.custom_data,
        items: tx.items,
      });

  await supabase.from("profiles").update(profileToRow(patch)).eq("id", user.id);
  return NextResponse.json(patch);
}
