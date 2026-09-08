import { NextResponse } from "next/server";
import { isPaddleConfigured, paddleRequest } from "@/lib/paddle";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST() {
  if (!isPaddleConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Paddle portal is not available." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("paddle_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.paddle_customer_id) {
    return NextResponse.json({ error: "No Paddle customer on file yet." }, { status: 400 });
  }

  const session = await paddleRequest<{ data?: { urls?: { general?: { overview?: string } } } }>(
    "POST",
    `/customers/${profile.paddle_customer_id}/portal-sessions`,
  );
  const url = session.data?.urls?.general?.overview;
  if (!url) return NextResponse.json({ error: "Could not open Paddle portal." }, { status: 500 });
  return NextResponse.json({ url });
}
