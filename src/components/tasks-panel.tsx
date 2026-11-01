"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { Check, Trash2 } from "@/components/ui/icons";
import { useStore } from "@/lib/store/provider";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import { useState } from "react";

export function TasksPanel({ projectId }: { projectId?: string }) {
  const { projects, tasks, createTask, updateTask, deleteTask } = useStore();
  const [title, setTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState(projectId ?? "");
  const [busy, setBusy] = useState(false);

  const selectable = projects.filter((project) => project.status !== "archived");
  const visible = tasks.filter((task) => (projectId ? task.projectId === projectId : true));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await createTask({ title, projectId: selectedProject });
      setTitle("");
      toast("Task added");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add task", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[1fr_16rem_auto] sm:items-end">
          <Field label="Task">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Design the homepage"
              required
            />
          </Field>
          <Field label="Project">
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a project
              </option>
              {selectable.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" disabled={busy || selectable.length === 0}>
            {busy ? "Adding…" : "Add task"}
          </Button>
        </form>
        {selectable.length === 0 ? (
          <p className="mt-3 text-sm text-text-secondary">
            Create a project first, then assign tasks to it.{" "}
            <Link href="/projects" className="font-medium text-primary hover:underline">
              Go to projects
            </Link>
          </p>
        ) : null}
      </Card>

      {visible.length === 0 ? (
        <Card>
          <p className="text-sm text-text-secondary">No tasks yet.</p>
        </Card>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-panel border border-border bg-surface">
          {visible.map((task) => {
            const project = projects.find((item) => item.id === task.projectId);
            return (
              <li key={task.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  aria-label={task.status === "completed" ? "Mark task open" : "Mark task done"}
                  onClick={() =>
                    updateTask(task.id, {
                      status: task.status === "completed" ? "todo" : "completed",
                    }).catch((err) =>
                      toast(err instanceof Error ? err.message : "Could not update task", "error"),
                    )
                  }
                  className={
                    task.status === "completed"
                      ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary text-white"
                      : "h-5 w-5 shrink-0 rounded-md border border-border-strong"
                  }
                >
                  {task.status === "completed" ? <Check className="h-3.5 w-3.5" /> : null}
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
                  {project ? (
                    <Link
                      href={`/projects/${project.id}`}
                      className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: project.color }}
                      />
                      {project.name}
                    </Link>
                  ) : (
                    <p className="mt-0.5 text-xs text-text-secondary">Project removed</p>
                  )}
                </div>
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
  );
}
