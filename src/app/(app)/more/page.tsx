"use client";

import { PageHeader } from "@/components/ui/card";
import { BarChart3, Check, ChevronRight, FileText, HelpCircle, Settings, Sparkles, Users } from "@/components/ui/icons";
import { ProBadge } from "@/components/ui/pro-badge";
import Link from "next/link";

const items = [
  { href: "/clients", label: "Clients", description: "Contacts, rates, and history", icon: Users },
  { href: "/tasks", label: "Tasks", description: "Work assigned to a project", icon: Check },
  { href: "/team", label: "Team", description: "Collaborators · Pro", icon: Users, pro: true },
  { href: "/reports", label: "Reports", description: "Time, earnings, productivity", icon: BarChart3 },
  { href: "/invoices", label: "Invoices", description: "Bill your tracked hours", icon: FileText },
  { href: "/billing", label: "Plan & billing", description: "Free, Pro, and Studio", icon: Sparkles },
  { href: "/settings", label: "Settings", description: "Profile and preferences", icon: Settings },
  { href: "/help", label: "Help & Support", description: "Guides and shortcuts", icon: HelpCircle },
];

export default function MorePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="More" description="Everything else in your workspace." />
      <ul className="divide-y divide-border overflow-hidden rounded-panel border border-border bg-surface card-surface">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3.5 px-4 py-4 transition hover:bg-surface-2"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="block text-sm font-medium text-text">{item.label}</span>
                    {"pro" in item && item.pro ? <ProBadge /> : null}
                  </span>
                  <span className="block text-xs text-text-secondary">{item.description}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
