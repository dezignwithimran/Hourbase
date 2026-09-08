"use client";

import { EntriesTable } from "@/components/entries-table";
import { ManualEntryForm } from "@/components/manual-entry-form";
import { TimerPanel } from "@/components/timer/timer-panel";
import { Card, PageHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { durationSeconds, formatDuration } from "@/lib/calculations";
import { combineDateAndTime, toDateInput, toTimeInput } from "@/lib/dates";
import { useStore } from "@/lib/store/provider";
import { TimeEntry } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { useMemo, useState } from "react";

export default function TimeTrackerPage() {
  const { timeEntries, projects, updateEntry } = useStore();
  const [tab, setTab] = useState("timer");
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const completed = timeEntries.filter((e) => e.status === "completed");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Tracker"
        description="Run a live timer or log work you already finished."
      >
        <Tabs
          tabs={[
            { id: "timer", label: "Timer" },
            { id: "manual", label: "Manual entry" },
            { id: "log", label: `Log (${completed.length})` },
          ]}
          value={tab}
          onChange={setTab}
        />
      </PageHeader>

      {tab === "timer" && <TimerPanel />}
      {tab === "manual" && (
        <Card className="max-w-3xl">
          <ManualEntryForm />
        </Card>
      )}
      {tab === "log" && <EntriesTable entries={completed} onEdit={setEditing} />}

      {editing ? (
        <EditEntryModal
          key={editing.id}
          entry={editing}
          projects={projects}
          onClose={() => setEditing(null)}
          onSave={updateEntry}
        />
      ) : null}
    </div>
  );
}

function EditEntryModal({
  entry,
  projects,
  onClose,
  onSave,
}: {
  entry: TimeEntry;
  projects: { id: string; name: string }[];
  onClose: () => void;
  onSave: (id: string, patch: Partial<TimeEntry>) => Promise<void>;
}) {
  const [description, setDescription] = useState(entry.description);
  const [projectId, setProjectId] = useState(entry.projectId);
  const [date, setDate] = useState(toDateInput(entry.startTime));
  const [startTime, setStartTime] = useState(toTimeInput(entry.startTime));
  const [endTime, setEndTime] = useState(
    entry.endTime ? toTimeInput(entry.endTime) : "17:00",
  );
  const [billable, setBillable] = useState(entry.billable);

  const duration = useMemo(
    () => durationSeconds(combineDateAndTime(date, startTime), combineDateAndTime(date, endTime)),
    [date, startTime, endTime],
  );

  return (
    <Modal open title="Edit time entry" description="Adjust the details and totals recalculate." onClose={onClose}>
      <div className="space-y-4">
        <Field label="Task">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Project">
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start">
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </Field>
          <Field label="End">
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-card border border-border bg-surface-2 px-4 py-3">
          <span className="text-sm text-text-secondary">Duration</span>
          <span className="num text-base font-semibold text-text">{formatDuration(duration)}</span>
        </div>
        <Toggle checked={billable} onChange={setBillable} label="Billable" />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={duration <= 0}
            onClick={async () => {
              const start = combineDateAndTime(date, startTime);
              const end = combineDateAndTime(date, endTime);
              await onSave(entry.id, {
                description,
                projectId,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                duration,
                billable,
              });
              toast("Entry updated");
              onClose();
            }}
          >
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
