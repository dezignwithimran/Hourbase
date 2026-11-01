import { createServiceClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Sign up is not configured." }, { status: 500 });
  }

  let payload: { name?: string; email?: string; password?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim().toLowerCase() ?? "";
  const password = payload.password ?? "";
  if (!name) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  if (!email.includes("@")) return NextResponse.json({ error: "Enter your email." }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (!error && data.user) {
    return NextResponse.json({ id: data.user.id, existing: false });
  }

  const message = error?.message.toLowerCase() ?? "";
  const alreadyExists = message.includes("already") || message.includes("registered");
  if (!alreadyExists) {
    return NextResponse.json(
      { error: error?.message || "Could not create the account." },
      { status: 400 },
    );
  }

  const existing = await findUserByEmail(admin, email);
  if (existing && !existing.email_confirmed_at) {
    await admin.auth.admin.updateUserById(existing.id, { email_confirm: true });
  }

  return NextResponse.json({ id: existing?.id ?? null, existing: true });
}

async function findUserByEmail(
  admin: NonNullable<ReturnType<typeof createServiceClient>>,
  email: string,
) {
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 200) return null;
  }
  return null;
}
