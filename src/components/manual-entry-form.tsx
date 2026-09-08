"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { durationSeconds, formatDuration } from "@/lib/calculations";
import { combineDateAndTime, toDateInput } from "@/lib/dates";
import { useStore } from "@/lib/store/provider";
import { toast } from "@/components/ui/toast";
import { useMemo, useState } from "react";

export function ManualEntryForm({
  defaultProjectId,
  onSaved,
}: {
  defaultProjectId?: string;
  onSaved?: () => void;
}) {
  const { clients, projects, addManualEntry } = useStore();
  const [date, setDate] = useState(toDateInput(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [description, setDescription] = useState("");
  const [billable, setBillable] = useState(true);

  const duration = useMemo(() => {
    try {
      return durationSeconds(
        combineDateAndTime(date, startTime),
        combineDateAndTime(date, endTime),
      );
    } catch {
      return 0;
    }
  }, [date, startTime, endTime]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addManualEntry({ date, startTime, endTime, projectId, description, billable });
      toast("Time entry saved");
      setDescription("");
      onSaved?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save entry", "error");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <Field label="Project">
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
            <option value="">Select project</option>
            {projects
              .filter((p) => p.status !== "archived")
              .map((p) => {
                const client = clients.find((c) => c.id === p.clientId);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {client ? ` · ${client.name}` : ""}
                  </option>
                );
              })}
          </Select>
        </Field>
        <Field label="Start time">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </Field>
        <Field label="End time">
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </Field>
      </div>

      <Field label="Task">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you work on?"
          required
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface-2 px-4 py-3">
        <Toggle checked={billable} onChange={setBillable} label="Billable" />
        <div className="text-right">
          <p className="text-xs text-text-secondary">Duration</p>
          <p className="num text-lg font-semibold text-text">{formatDuration(duration)}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={duration <= 0}>
          Add entry
        </Button>
      </div>
    </form>
  );
}
