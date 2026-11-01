"use client";

import { useStore } from "@/lib/store/provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandMark } from "@/components/ui/avatar";
import { BarChart3, Clock, FileText } from "@/components/ui/icons";

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { ready, user, profile } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (!ready || !user) return;
    if (!profile?.onboardingCompleted) router.replace("/onboarding");
    else router.replace("/dashboard");
  }, [ready, user, profile, router]);
  return <>{children}</>;
}

const highlights = [
  {
    icon: Clock,
    title: "One-tap tracking",
    body: "Start a timer in a second and never lose billable minutes again.",
  },
  {
    icon: BarChart3,
    title: "Earnings in real time",
    body: "Every tracked hour turns into revenue you can see instantly.",
  },
  {
    icon: FileText,
    title: "Invoices without admin",
    body: "Turn approved time into a professional invoice in two clicks.",
  },
];

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,1fr)]">
      <aside className="brand-gradient relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="bg-dots absolute inset-0 opacity-25" />
        <div className="absolute -top-28 -right-16 h-[28rem] w-[28rem] rounded-full bg-white/12 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute -bottom-36 -left-16 h-[26rem] w-[26rem] rounded-full bg-black/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <svg
              viewBox="0 0 24 24"
              className="h-4.5 w-4.5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5V12l3 1.8" />
            </svg>
          </span>
          <span className="font-semibold text-white">Hourbase</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl leading-[1.1] font-semibold text-white">
            Track your time.
            <br />
            Know your value.
            <br />
            <span className="text-white/70">Get paid accurately.</span>
          </h2>
          <div className="mt-10 space-y-5">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <Icon className="h-4 w-4 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-sm text-white/70">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-white/70">
          <div>
            <p className="num text-2xl font-semibold text-white">100%</p>
            <p className="text-xs">of billable time captured</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <p className="num text-2xl font-semibold text-white">2 clicks</p>
            <p className="text-xs">from tracked work to invoice</p>
          </div>
        </div>
      </aside>

      <main className="app-canvas flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="animate-slide-up w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>
          <div className="rounded-panel border border-border bg-surface p-7 card-surface sm:p-8">
            <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-text">
              {title}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function ContinueWithGoogle() {
  const { loginWithGoogle } = useStore();
  return (
    <>
      <AuthDivider />
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() =>
          loginWithGoogle().catch((err) =>
            toast(err instanceof Error ? err.message : "Google sign-in unavailable", "error"),
          )
        }
      >
        <GoogleIcon />
        Continue with Google
      </Button>
    </>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.86-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.79-2.11-6.74-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.26 14.27a7.2 7.2 0 0 1 0-4.54V6.64H1.28a12 12 0 0 0 0 10.72l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.2 15.24 0 12 0A12 12 0 0 0 1.28 6.64l3.98 3.09C6.21 6.87 8.87 4.76 12 4.76Z"
      />
    </svg>
  );
}
