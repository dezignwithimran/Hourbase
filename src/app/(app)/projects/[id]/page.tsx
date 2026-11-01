"use client";

import { EntriesTable } from "@/components/entries-table";
import { TasksPanel } from "@/components/tasks-panel";
import { ProjectBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi";
import { Tabs } from "@/components/ui/tabs";
import { formatHours, formatMoney, formatPercent } from "@/lib/calculations";
import { projectStats, reportMetrics } from "@/lib/stats";
import { clientLabel } from "@/lib/store/helpers";
import { useStore } from "@/lib/store/provider";
import { ProjectStatus } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { Archive, ArrowLeft, Clock, DollarSign, Target, Trash2, Zap } from "@/components/ui/icons";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { projects, clients, tasks, timeEntries, updateProject, archiveProject, deleteProject, activeTimer, profile } =
    useStore();
  const project = projects.find((p) => p.id === id);
  const client = clients.find((c) => c.id === project?.clientId);
  const clientName = project ? clientLabel(project, clients) : "—";
  const [tab, setTab] = useState("overview");
  const [confirm, setConfirm] = useState<null | "archive" | "delete">(null);

  if (!project) {
    return (
      <Card className="text-center">
        <p className="text-sm text-text-secondary">This project no longer exists.</p>
        <Link href="/projects" className="mt-3 inline-block text-sm font-medium text-primary">
          Back to projects
        </Link>
      </Card>
    );
  }

  const stats = projectStats(project, timeEntries);
  const entries = timeEntries.filter((e) => e.projectId === project.id && e.status === "completed");
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const metrics = reportMetrics(entries);

  return (
    <div className="space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" /> Projects
      </Link>

      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
            style={{ background: project.color }}
          />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">{project.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
              {client ? (
                <Link href={`/clients/${client.id}`} className="hover:text-primary">
                  {client.name}
                </Link>
              ) : clientName !== "—" ? (
                <span>{clientName}</span>
              ) : null}
              <ProjectBadge status={project.status} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setTab("settings")}>
            Edit project
          </Button>
          {project.status !== "archived" ? (
            <Button variant="outline" onClick={() => setConfirm("archive")}>
              <Archive className="h-4 w-4" /> Archive
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => setConfirm("delete")}>
            <Trash2 className="h-4 w-4 text-danger" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total hours" value={formatHours(stats.hours * 3600)} icon={<Clock />} />
        <KpiCard
          label="Billable hours"
          value={formatHours(stats.billableHours * 3600)}
          icon={<Zap />}
          accent="warning"
        />
        <KpiCard
          label="Earnings"
          value={formatMoney(stats.earnings, profile?.currency)}
          icon={<DollarSign />}
          accent="success"
        />
        <KpiCard
          label="Hourly rate"
          value={formatMoney(project.hourlyRate, profile?.currency ?? project.currency)}
          hint={project.billingType}
          icon={<Target />}
          accent="neutral"
        />
      </div>

      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "tasks", label: `Tasks (${projectTasks.length})` },
          { id: "time", label: `Time entries (${entries.length})` },
          { id: "reports", label: "Reports" },
          { id: "settings", label: "Settings" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <Card>
          <h2 className="text-base font-semibold text-text">About this project</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {project.description || "No description yet. Add one from the Settings tab."}
          </p>
          <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-text-secondary">Billing type</dt>
              <dd className="mt-1 text-sm font-medium text-text capitalize">
                {project.billingType}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Start date</dt>
              <dd className="mt-1 text-sm font-medium text-text">{project.startDate || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">End date</dt>
              <dd className="mt-1 text-sm font-medium text-text">{project.endDate || "—"}</dd>
            </div>
          </dl>
        </Card>
      )}

      {tab === "tasks" && <TasksPanel projectId={project.id} />}

      {tab === "time" && <EntriesTable entries={entries} />}

      {tab === "reports" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Tracked" value={formatHours(metrics.tracked * 3600)} />
          <KpiCard label="Billable share" value={formatPercent(metrics.billablePct)} />
          <KpiCard
            label="Effective rate"
            value={formatMoney(metrics.avgRate, profile?.currency)}
          />
        </div>
      )}

      {tab === "settings" && (
        <Card className="max-w-xl space-y-4">
          <Field label="Name">
            <Input
              defaultValue={project.name}
              onBlur={(e) => updateProject(project.id, { name: e.target.value })}
            />
          </Field>
          <Field label="Client">
            <Select
              value={clients.some((c) => c.id === project.clientId) ? project.clientId : ""}
              onChange={(e) => updateProject(project.id, { clientId: e.target.value })}
            >
              <option value="" disabled>
                Select a client
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description">
            <Textarea
              defaultValue={project.description}
              onBlur={(e) => updateProject(project.id, { description: e.target.value })}
            />
          </Field>
          <Field label="Hourly rate">
            <Input
              type="number"
              defaultValue={project.hourlyRate}
              onBlur={(e) => updateProject(project.id, { hourlyRate: Number(e.target.value) })}
            />
          </Field>
          <Field label="Status">
            <Select
              defaultValue={project.status}
              onChange={(e) =>
                updateProject(project.id, { status: e.target.value as ProjectStatus })
              }
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <p className="text-xs text-text-secondary">Changes save when you leave a field.</p>
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-text">Delete project</p>
            <p className="mt-1 text-xs text-text-secondary">
              Removes this project, its tasks, and every time entry on it. Invoices are not changed.
            </p>
            <Button variant="outline" className="mt-3" onClick={() => setConfirm("delete")}>
              <Trash2 className="h-4 w-4 text-danger" /> Delete project
            </Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirm === "archive"}
        title="Archive this project?"
        description="It leaves your active lists, but all tracked history and earnings stay intact."
        confirmLabel="Archive project"
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const id = project.id;
          setConfirm(null);
          router.replace("/projects");
          await archiveProject(id);
          toast("Project archived");
        }}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        title="Delete this project?"
        description={
          activeTimer?.projectId === project.id
            ? "A timer is running on this project and will be stopped. This permanently removes the project and all of its time entries. Invoices are not affected."
            : "This permanently removes the project and all of its time entries. Invoices are not affected."
        }
        confirmLabel="Delete project"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const id = project.id;
          setConfirm(null);
          router.replace("/projects");
          await deleteProject(id);
          toast("Project deleted");
        }}
      />
    </div>
  );
}
