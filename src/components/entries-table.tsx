"use client";

import { BillableBadge } from "@/components/ui/badge";
import { ConfirmDialog, EmptyState } from "@/components/ui/feedback";
import { TableShell } from "@/components/ui/card";
import { formatDuration, formatMoney } from "@/lib/calculations";
import { formatDate } from "@/lib/dates";
import { useStore } from "@/lib/store/provider";
import { TimeEntry } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { Copy, Pencil, Trash2 } from "@/components/ui/icons";
import { useState } from "react";

export function EntriesTable({
  entries,
  onEdit,
}: {
  entries: TimeEntry[];
  onEdit?: (entry: TimeEntry) => void;
}) {
  const { clients, projects, profile, deleteEntry, duplicateEntry } = useStore();
  const [pending, setPending] = useState<string | null>(null);

  if (!entries.length) {
    return (
      <EmptyState
        title="No time entries"
        description="Tracked work will appear here with duration, billable status, and earnings."
      />
    );
  }

  return (
    <>
      <TableShell>
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Date</th>
              <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Project</th>
              <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Client</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                Duration
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-text-secondary">Billable</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                Earnings
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const project = projects.find((p) => p.id === e.projectId);
              const client = clients.find((c) => c.id === e.clientId);
              return (
                <tr
                  key={e.id}
                  className="group border-b border-border transition-colors last:border-0 hover:bg-surface-2"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap text-text-secondary">
                    {formatDate(e.startTime)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: project?.color ?? "#94a3b8" }}
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-text">
                          {project?.name ?? "—"}
                        </div>
                        <div className="truncate text-xs text-text-secondary">{e.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{client?.name ?? "—"}</td>
                  <td className="num px-5 py-3.5 text-right font-medium text-text">
                    {formatDuration(e.duration)}
                  </td>
                  <td className="px-5 py-3.5">
                    <BillableBadge billable={e.billable} />
                  </td>
                  <td className="num px-5 py-3.5 text-right font-semibold text-text">
                    {formatMoney(e.earnings, profile?.currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                      {onEdit ? (
                        <button
                          type="button"
                          aria-label="Edit entry"
                          className="rounded-md p-1.5 text-text-secondary transition hover:bg-muted hover:text-primary"
                          onClick={() => onEdit(e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        aria-label="Duplicate entry"
                        className="rounded-md p-1.5 text-text-secondary transition hover:bg-muted hover:text-text"
                        onClick={() => duplicateEntry(e.id).then(() => toast("Entry duplicated"))}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete entry"
                        className="rounded-md p-1.5 text-text-secondary transition hover:bg-danger-soft hover:text-danger"
                        onClick={() => setPending(e.id)}
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
      <ConfirmDialog
        open={Boolean(pending)}
        title="Delete time entry?"
        description="This removes the tracked time and its earnings. This cannot be undone."
        confirmLabel="Delete entry"
        danger
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) deleteEntry(pending);
          setPending(null);
          toast("Entry deleted");
        }}
      />
    </>
  );
}
