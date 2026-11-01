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

export default function SignupPage() {
  const { signup } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });

  const nameEmpty = name.trim().length === 0;
  const emailEmpty = email.trim().length === 0;
  const passwordEmpty = password.length === 0;
  const confirmEmpty = confirm.length === 0;
  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordsMismatch = password.length > 0 && confirm.length > 0 && password !== confirm;

  const nameInvalid = nameEmpty && (attempted || touched.name);
  const emailInvalid = emailEmpty && (attempted || touched.email);
  const passwordInvalid =
    (passwordEmpty && (attempted || touched.password)) || passwordTooShort || passwordsMismatch;
  const confirmInvalid = (confirmEmpty && (attempted || touched.confirm)) || passwordsMismatch;

  const passwordError = passwordEmpty
    ? "Enter a password."
    : passwordTooShort
      ? "At least 8 characters."
      : passwordsMismatch
        ? "Passwords do not match."
        : undefined;
  const confirmError = confirmEmpty
    ? "Confirm your password."
    : passwordsMismatch
      ? "Passwords do not match."
      : undefined;

  function markTouched(field: "name" | "email" | "password" | "confirm") {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (
      nameEmpty ||
      emailEmpty ||
      passwordEmpty ||
      confirmEmpty ||
      passwordTooShort ||
      passwordsMismatch
    ) {
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
        <form noValidate onSubmit={onSubmit} className="space-y-4">
          <Field label="Full name" error={nameInvalid ? "Enter your name." : undefined}>
            <Input
              placeholder="Imran Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => markTouched("name")}
              required
              aria-invalid={nameInvalid}
              className={nameInvalid ? invalidField : undefined}
            />
          </Field>
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
          <Field
            label="Password"
            hint={passwordInvalid ? undefined : "At least 8 characters."}
            error={passwordInvalid ? passwordError : undefined}
          >
            <PasswordInput
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => markTouched("password")}
              required
              minLength={8}
              aria-invalid={passwordInvalid}
              className={passwordInvalid ? invalidField : undefined}
            />
          </Field>
          <Field label="Confirm password" error={confirmInvalid ? confirmError : undefined}>
            <PasswordInput
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => markTouched("confirm")}
              required
              aria-invalid={confirmInvalid}
              className={confirmInvalid ? invalidField : undefined}
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
