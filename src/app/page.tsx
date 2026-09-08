"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/provider";
import { PageLoader } from "@/components/ui/feedback";

export default function HomePage() {
  const { ready, user, profile } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (!profile?.onboardingCompleted) router.replace("/onboarding");
    else router.replace("/dashboard");
  }, [ready, user, profile, router]);

  return <PageLoader />;
}
