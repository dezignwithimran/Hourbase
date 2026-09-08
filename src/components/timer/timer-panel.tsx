"use client";

import { useEffect, useState } from "react";
import { Pause, Play, Square } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "@/components/ui/toast";
import { earningsFromDuration, formatDuration, formatMoney } from "@/lib/calculations";
import { liveDuration } from "@/lib/store/helpers";
import { useStore } from "@/lib/store/provider";

export function TimerPanel({ compact = false }: { compact?: boolean }) {
  const {
    clients,
    projects,
    activeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    profile,
  } = useStore();
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [billable, setBillable] = useState(true);
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

  async function onStart() {
    try {
      await startTimer({ projectId, description, billable });
      toast("Timer started");
      setDescription("");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not start timer", "error");
    }
  }

  if (activeTimer) {
    const running = activeTimer.status === "running";
    return (
      <div className="relative overflow-hidden rounded-panel border border-border/80 bg-surface card-surface">
        <div className="brand-gradient absolute inset-x-0 top-0 h-1 opacity-80" />
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {running && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${running ? "bg-success" : "bg-warning"}`}
                />
              </span>
              <p className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
                {running ? "Tracking now" : "Paused"}
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
              {running ? (
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
    );
  }

  return (
    <div className="rounded-panel border border-border/80 bg-surface p-6 card-surface">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text">Start tracking</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Pick a project, describe the task, and go.
          </p>
        </div>
        <Toggle checked={billable} onChange={setBillable} label="Billable" />
      </div>

      <div className={compact ? "mt-4 grid gap-2.5" : "mt-4 grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"}>
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
            if (e.key === "Enter") onStart();
          }}
        />
        <Button onClick={onStart} disabled={!activeProjects.length}>
          <Play className="h-3.5 w-3.5 fill-current" /> Start timer
        </Button>
      </div>

      {!activeProjects.length && (
        <p className="mt-3 text-xs text-text-secondary">
          Create a project first to begin tracking time.
        </p>
      )}
    </div>
  );
}
