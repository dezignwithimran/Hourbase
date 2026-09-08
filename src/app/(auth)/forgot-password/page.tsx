"use client";

import { AuthCard, GuestOnly } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useStore } from "@/lib/store/provider";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, MailCheck } from "@/components/ui/icons";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSent(true);
      toast("If that email exists, a reset link is on the way.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not send reset", "error");
    }
  }

  return (
    <GuestOnly>
      <AuthCard
        title="Reset your password"
        subtitle="We’ll email a secure reset link to your account address."
      >
        {sent ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-card border border-border bg-surface-2 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
                <MailCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-text">Check your inbox</p>
                <p className="mt-0.5 text-sm text-text-secondary">
                  If an account exists for {email}, the reset link is on its way.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email">
              <Input
                type="email"
                placeholder="you@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" size="lg" className="w-full">
              Send reset link
            </Button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </form>
        )}
      </AuthCard>
    </GuestOnly>
  );
}
