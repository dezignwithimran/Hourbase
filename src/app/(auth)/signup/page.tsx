"use client";

import { AuthCard, ContinueWithGoogle, GuestOnly } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput } from "@/components/ui/input";
import { useStore } from "@/lib/store/provider";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const { signup } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast("Passwords do not match", "error");
      return;
    }
    if (password.length < 8) {
      toast("Use at least 8 characters", "error");
      return;
    }
    setBusy(true);
    try {
      await signup(name, email, password);
      toast("Account created");
      router.replace("/onboarding");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not sign up", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <GuestOnly>
      <AuthCard
        title="Create your account"
        subtitle="Set up your workspace and start tracking in under a minute."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Full name">
            <Input
              placeholder="Imran Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              placeholder="you@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password" hint="At least 8 characters.">
            <PasswordInput
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field label="Confirm password">
            <PasswordInput
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </Button>

          <ContinueWithGoogle />

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </AuthCard>
    </GuestOnly>
  );
}
