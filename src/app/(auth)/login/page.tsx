"use client";

import { AuthCard, ContinueWithGoogle, GuestOnly } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput } from "@/components/ui/input";
import { useStore } from "@/lib/store/provider";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const invalidField =
  "border-danger bg-danger-soft text-danger hover:border-danger focus:border-danger focus:bg-danger-soft focus:ring-danger/15";

export default function LoginPage() {
  const { login, usingSupabase } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailEmpty = email.trim().length === 0;
  const passwordEmpty = password.length === 0;
  const passwordTooShort = password.length > 0 && password.length < 8;
  const emailInvalid = emailEmpty && (attempted || touched.email);
  const passwordInvalid =
    (passwordEmpty && (attempted || touched.password)) || passwordTooShort;
  const passwordError = passwordEmpty
    ? "Enter a password."
    : passwordTooShort
      ? "At least 8 characters."
      : undefined;

  function markTouched(field: "email" | "password") {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (emailEmpty || passwordEmpty || passwordTooShort) return;
    setBusy(true);
    try {
      await login(email, password);
      toast("Welcome back");
      router.replace("/dashboard");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Login failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <GuestOnly>
      <AuthCard title="Welcome back" subtitle="Log in to pick up where your timer left off.">
        <form noValidate onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" error={emailInvalid ? "Enter your email." : undefined}>
            <Input
              type="email"
              placeholder="you@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => markTouched("email")}
              required
              aria-invalid={emailInvalid}
              className={emailInvalid ? invalidField : undefined}
            />
          </Field>
          <Field label="Password" error={passwordInvalid ? passwordError : undefined}>
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => markTouched("password")}
              required
              minLength={8}
              aria-invalid={passwordInvalid}
              className={passwordInvalid ? invalidField : undefined}
            />
          </Field>
          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-strong accent-[#2563eb]"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Log in"}
          </Button>

          <ContinueWithGoogle />

          {!usingSupabase && (
            <p className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-center text-xs text-text-secondary">
              Local demo mode — data stays in this browser until Supabase keys are added.
            </p>
          )}

          <p className="text-center text-sm text-text-secondary">
            New here?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </AuthCard>
    </GuestOnly>
  );
}
