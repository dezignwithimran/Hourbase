"use client";

import { CreateProjectModal } from "@/components/project-form";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { ProjectBadge } from "@/components/ui/badge";
import { PageHeader, TableShell } from "@/components/ui/card";
import { ConfirmDialog, EmptyState } from "@/components/ui/feedback";
import { SearchInput, Select } from "@/components/ui/input";
import { canCreate } from "@/lib/billing";
import type { PlanFeature } from "@/lib/billing";
import { formatHours, formatMoney } from "@/lib/calculations";
import { projectStats } from "@/lib/stats";
import { clientLabel } from "@/lib/store/helpers";
import { useStore } from "@/lib/store/provider";
import { Project, ProjectStatus } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { FolderKanban, Trash2 } from "@/components/ui/icons";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function ProjectsPage() {
  const { projects, clients, timeEntries, profile, deleteProject, activeTimer } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [open, setOpen] = useState(false);
  const [upgrade, setUpgrade] = useState<PlanFeature | null>(null);
  const [pending, setPending] = useState<Project | null>(null);

  function openCreate() {
    if (!canCreate("projects", projects.length, profile?.plan)) {
      setUpgrade("projects");
      return;
    }
    setOpen(true);
  }

  const list = useMemo(
    () =>
      projects.filter((p) => {
        const match = p.name.toLowerCase().includes(q.toLowerCase());
        const st = status === "all" || p.status === status;
        return match && st;
      }),
    [projects, q, status],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Every project keeps its own rate, so earnings stay accurate."
      >
        <div className="flex flex-wrap gap-2">
          <SearchInput
            placeholder="Search projects"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:max-w-xs"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-auto"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
      </PageHeader>

      {list.length === 0 ? (
        <EmptyState
          icon={<FolderKanban />}
          title={q || status !== "all" ? "No matching projects" : "No projects yet"}
          description="Projects organize time by client so billing and reporting stay accurate."
          action={{ label: "Create project", onClick: openCreate }}
        />
      ) : (
        <TableShell>
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Project</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Client</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Tracked
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Billable
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Earnings
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  Rate
                </th>
                <th className="sticky right-0 z-10 bg-surface-2 px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const stats = projectStats(p, timeEntries);
                return (
                  <tr
                    key={p.id}
                    className="group border-b border-border transition-colors last:border-0 hover:bg-surface-2"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: p.color }}
                        />
                        <Link
                          href={`/projects/${p.id}`}
                          className="font-medium text-text hover:text-primary"
                        >
                          {p.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">{clientLabel(p, clients)}</td>
                    <td className="px-5 py-3.5">
                      <ProjectBadge status={p.status} />
                    </td>
                    <td className="num px-5 py-3.5 text-right text-text">
                      {formatHours(stats.hours * 3600)}
                    </td>
                    <td className="num px-5 py-3.5 text-right text-text">
                      {formatHours(stats.billableHours * 3600)}
                    </td>
                    <td className="num px-5 py-3.5 text-right font-semibold text-text">
                      {formatMoney(stats.earnings, profile?.currency)}
                    </td>
                    <td className="num px-5 py-3.5 text-right text-text-secondary">
                      {formatMoney(p.hourlyRate, profile?.currency ?? p.currency)}
                    </td>
                    <td className="sticky right-0 z-10 bg-surface px-5 py-3.5 shadow-[-12px_0_12px_-12px_rgb(15_23_42/0.18)] group-hover:bg-surface-2">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          aria-label={`Delete ${p.name}`}
                          className="rounded-md p-1.5 text-text-secondary transition hover:bg-danger-soft hover:text-danger"
                          onClick={() => setPending(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableShell>
      )}

      <CreateProjectModal
        open={open}
        onClose={() => setOpen(false)}
        onPlanLimit={setUpgrade}
      />
      <UpgradeDialog
        open={Boolean(upgrade)}
        feature={upgrade ?? undefined}
        onClose={() => setUpgrade(null)}
      />
      <ConfirmDialog
        open={Boolean(pending)}
        title={pending ? `Delete ${pending.name}?` : "Delete this project?"}
        description={
          pending && activeTimer?.projectId === pending.id
            ? "A timer is running on this project and will be stopped. This permanently removes the project and all of its time entries. Invoices are not affected."
            : "This permanently removes the project and all of its time entries. Invoices are not affected."
        }
        confirmLabel="Delete project"
        danger
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return;
          const id = pending.id;
          setPending(null);
          await deleteProject(id);
          toast("Project deleted");
        }}
      />
    </div>
  );
}
