"use client";

import { TasksPanel } from "@/components/tasks-panel";
import { PageHeader } from "@/components/ui/card";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Add a task and choose which project it belongs to."
      />
      <TasksPanel />
    </div>
  );
}
