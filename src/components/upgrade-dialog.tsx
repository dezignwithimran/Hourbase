"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/feedback";
import { getPlan } from "@/lib/billing";
import type { PlanFeature } from "@/lib/billing";
import { Sparkles } from "@/components/ui/icons";
import { useRouter } from "next/navigation";

const labels: Record<PlanFeature, string> = {
  projects: "projects",
  clients: "clients",
  invoices: "invoices",
};

export function UpgradeDialog({
  open,
  feature,
  onClose,
}: {
  open: boolean;
  feature?: PlanFeature;
  onClose: () => void;
}) {
  const router = useRouter();
  const free = getPlan("free");
  const limit = feature ? free.limits[feature] : null;

  return (
    <Modal
      open={open}
      title="Upgrade to keep growing"
      description={
        feature && limit != null
          ? `Free includes ${limit} ${labels[feature]}. Pro unlocks unlimited ${labels[feature]}.`
          : "Pro unlocks unlimited projects, clients, and invoices."
      }
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="rounded-card border border-border bg-surface-2 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-text">
            <Sparkles className="h-4 w-4 text-primary" />
            Pro · $12/month
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Unlimited projects, clients, and invoices, plus team workspace and priority support.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Not now
          </Button>
          <Button
            onClick={() => {
              onClose();
              router.push("/billing");
            }}
          >
            View plans
          </Button>
        </div>
      </div>
    </Modal>
  );
}
