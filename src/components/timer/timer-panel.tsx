"use client";

import { useEffect, useState } from "react";
import { Check, Pause, Pencil, Play, Square, Trash2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { earningsFromDuration, formatDuration, formatHours, formatMoney } from "@/lib/calculations";
import { liveDuration } from "@/lib/store/helpers";
import { useStore } from "@/lib/store/provider";
import type { Task, TaskStatus } from "@/lib/types";

export function TimerPanel({ compact = false }: { compact?: boolean }) {
  const {
    clients,
    projects,
    tasks,
    timeEntries,
    activeTimer,
    createTask,
    updateTask,
    deleteTask,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    profile,
  } = useStore();
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<TaskStatus>("todo");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", projectId: "", dueDate: "" });
  const [, setTick] = useState(0);

  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "paused");

  useEffect(() => {
    if (!projectId && activeProjects[0]) setProjectId(activeProjects[0].id);
  }, [activeProjects, projectId]);

  useEffect(() => {
    if (activeTimer?.status !== "running") return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [activeTimer?.status]);

  const elapsed = activeTimer ? liveDuration(activeTimer) : 0;
  const runningProject = projects.find((p) => p.id === activeTimer?.projectId);
  const runningClient = clients.find((c) => c.id === activeTimer?.clientId);
  const liveEarn = activeTimer
    ? earningsFromDuration(activeTimer.billable, elapsed, activeTimer.hourlyRate)
    : 0;

  async function onAdd() {
    setAdding(true);
    try {
      await createTask({ title: description, projectId, dueDate: dueDate || null });
      toast("Task added");
      setDescription("");
      setDueDate("");
      setFilter("todo");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not add task", "error");
    } finally {
      setAdding(false);
    }
  }

  async function onPlay(task: Task) {
    const active = timeEntries.find(
      (entry) =>
        entry.userId === task.userId &&
        (entry.status === "running" || entry.status === "paused") &&
        entry.taskId === task.id,
    );
    try {
      if (active?.status === "paused") {
        await resumeTimer();
        toast("Timer resumed");
        return;
      }
      if (active?.status === "running") return;
      await startTimer({
        projectId: task.projectId,
        description: task.title,
        billable: true,
        taskId: task.id,
      });
      toast("Timer started");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not start timer", "error");
    }
  }

  async function onComplete(task: Task) {
    try {
      if (activeTimer?.taskId === task.id) await stopTimer();
      await updateTask(task.id, { status: "completed" });
      toast("Task completed");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update task", "error");
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setDraft({ title: task.title, projectId: task.projectId, dueDate: task.dueDate ?? "" });
  }

  async function saveEdit(id: string) {
    try {
      await updateTask(id, {
        title: draft.title,
        projectId: draft.projectId,
        dueDate: draft.dueDate || null,
      });
      setEditingId(null);
      toast("Task updated");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update task", "error");
    }
  }

  const visible = tasks.filter((task) => task.status === filter);

  return (
    <div className="space-y-4">
      {activeTimer ? (
        <div className="relative overflow-hidden rounded-panel border border-border/80 bg-surface card-surface">
          <div className="brand-gradient absolute inset-x-0 top-0 h-1 opacity-80" />
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {activeTimer.status === "running" && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  )}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      activeTimer.status === "running" ? "bg-success" : "bg-warning"
                    }`}
                  />
                </span>
                <p className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
                  {activeTimer.status === "running" ? "Tracking now" : "Paused"}
                </p>
              </div>
              <p className="num mt-3 text-5xl leading-none font-semibold text-text sm:text-6xl">
                {formatDuration(elapsed)}
              </p>
              <p className="mt-3 truncate text-sm text-text-secondary">
                <span className="font-medium text-text">{runningProject?.name}</span>
                {runningClient ? ` · ${runningClient.name}` : ""} · {activeTimer.description}
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <div className="rounded-2xl bg-surface-2 px-4 py-3 text-right">
                <p className="text-[11px] font-medium tracking-wide text-text-secondary uppercase">
                  {activeTimer.billable ? "Earning" : "Non-billable"}
                </p>
                <p className="num mt-0.5 text-2xl font-semibold text-text">
                  {formatMoney(liveEarn, profile?.currency)}
                </p>
              </div>
              <div className="flex gap-2">
                {activeTimer.status === "running" ? (
                  <Button variant="outline" size="lg" onClick={() => pauseTimer()}>
                    <Pause className="h-4 w-4" /> Pause
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => resumeTimer()}>
                    <Play className="h-4 w-4 fill-current" /> Resume
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="lg"
                  onClick={() => stopTimer().then(() => toast("Time entry saved"))}
                >
                  <Square className="h-3.5 w-3.5 fill-current" /> Stop
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-panel border border-border/80 bg-surface p-6 card-surface">
        <div>
          <p className="text-sm font-semibold text-text">Plan your work</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Add a task to a project, then start the timer when you are ready.
          </p>
        </div>

        <div
          className={
            compact
              ? "mt-4 grid gap-2.5"
              : "mt-4 grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_10.5rem_auto]"
          }
        >
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Select project</option>
            {activeProjects.map((p) => {
              const client = clients.find((c) => c.id === p.clientId);
              return (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {client ? ` · ${client.name}` : ""}
                </option>
              );
            })}
          </Select>
          <Input
            placeholder="What are you working on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdd();
            }}
          />
          <Input
            type="date"
            aria-label="Due date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Button onClick={onAdd} disabled={adding || !activeProjects.length}>
            {adding ? "Adding…" : "Add task"}
          </Button>
        </div>

        {!activeProjects.length && (
          <p className="mt-3 text-xs text-text-secondary">Create a project first to add tasks.</p>
        )}
      </div>

      <div className="rounded-panel border border-border/80 bg-surface p-6 card-surface">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-text">My Tasks</p>
          <Tabs
            tabs={[
              { id: "todo", label: "To do" },
              { id: "in_progress", label: "In Progress" },
              { id: "completed", label: "Completed" },
            ]}
            value={filter}
            onChange={(id) => setFilter(id as TaskStatus)}
          />
        </div>

        {visible.length === 0 ? (
          <p className="mt-4 text-sm text-text-secondary">No tasks in this list.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
            {visible.map((task) => {
              const project = projects.find((item) => item.id === task.projectId);
              const seconds = timeEntries.reduce((total, entry) => {
                if (entry.taskId !== task.id) return total;
                const amount =
                  entry.status === "running" || entry.status === "paused"
                    ? liveDuration(entry)
                    : entry.duration;
                return total + amount;
              }, 0);
              const runningThis = activeTimer?.taskId === task.id && activeTimer.status === "running";
              if (editingId === task.id) {
                return (
                  <li key={task.id} className="grid gap-2 p-3 sm:grid-cols-[1fr_12rem_10rem_auto]">
                    <Input
                      value={draft.title}
                      onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
                    />
                    <Select
                      value={draft.projectId}
                      onChange={(e) => setDraft((current) => ({ ...current, projectId: e.target.value }))}
                    >
                      {projects
                        .filter((item) => item.status !== "archived")
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                    </Select>
                    <Input
                      type="date"
                      aria-label="Due date"
                      value={draft.dueDate}
                      onChange={(e) => setDraft((current) => ({ ...current, dueDate: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="h-10" onClick={() => saveEdit(task.id)}>
                        Save
                      </Button>
                      <Button variant="outline" size="sm" className="h-10" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </li>
                );
              }
              return (
                <li key={task.id} className="flex items-center gap-3 px-3 py-3">
                  <button
                    type="button"
                    aria-label={runningThis ? "Timer is running" : "Start timer"}
                    disabled={runningThis}
                    onClick={() => onPlay(task)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-dark disabled:opacity-60"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        task.status === "completed"
                          ? "truncate text-sm text-text-secondary line-through"
                          : "truncate text-sm font-medium text-text"
                      }
                    >
                      {task.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-secondary">
                      {project?.name ?? "Project removed"}
                      {task.dueDate ? ` · Due ${task.dueDate}` : ""}
                      {" · "}
                      {formatHours(seconds)}
                    </p>
                  </div>
                  {task.status !== "completed" ? (
                    <button
                      type="button"
                      aria-label="Mark completed"
                      onClick={() => onComplete(task)}
                      className="rounded-md p-1.5 text-text-secondary transition hover:bg-primary-soft hover:text-primary"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label="Edit task"
                    onClick={() => startEdit(task)}
                    className="rounded-md p-1.5 text-text-secondary transition hover:bg-muted hover:text-text"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete task"
                    onClick={() =>
                      deleteTask(task.id).catch((err) =>
                        toast(err instanceof Error ? err.message : "Could not delete task", "error"),
                      )
                    }
                    className="rounded-md p-1.5 text-text-secondary transition hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
