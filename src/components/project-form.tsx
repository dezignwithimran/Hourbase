"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { PlanLimitError, canCreate, getPlan } from "@/lib/billing";
import { useStore } from "@/lib/store/provider";
import { toast } from "@/components/ui/toast";
import { useEffect, useState } from "react";

const colors = ["#165DFC", "#0F4AD4", "#16A34A", "#F59E0B", "#DC2626", "#0EA5E9"];
const NEW_CLIENT = "__new__";

export function CreateProjectModal({
  open,
  onClose,
  onCreated,
  onPlanLimit,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onPlanLimit?: (feature: "projects" | "clients" | "invoices") => void;
}) {
  const { clients, projects, profile, createProject } = useStore();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState("75");
  const [billingType, setBillingType] = useState<"hourly" | "fixed">("hourly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setNewClientName("");
    setHourlyRate(String(profile?.defaultHourlyRate ?? 75));
    setBillingType("hourly");
    setStartDate("");
    setEndDate("");
    setColor(colors[0]);
    setClientId(clients[0]?.id ?? NEW_CLIENT);
  }, [open, clients, profile?.defaultHourlyRate]);

  const creatingClient = clientId === NEW_CLIENT || !clients.length;
  const canSubmit = Boolean(name.trim() && (creatingClient ? newClientName.trim() : clientId) && !busy);

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    try {
      if (creatingClient && !canCreate("clients", clients.length, profile?.plan)) {
        throw new PlanLimitError("clients", getPlan(profile?.plan).limits.clients ?? 3);
      }
      await createProject({
        clientId: creatingClient ? "" : clientId,
        name: name.trim(),
        description,
        hourlyRate: Number(hourlyRate) || 0,
        currency: profile?.currency ?? "USD",
        billingType,
        status: "active",
        startDate,
        endDate,
        color,
        ...(creatingClient
          ? {
              newClient: {
                name: newClientName.trim(),
                company: "",
                email: "",
                phone: "",
                notes: "",
              },
            }
          : {}),
      });
      toast("Project created");
      onCreated?.();
      onClose();
    } catch (e) {
      if (e instanceof PlanLimitError) {
        onClose();
        onPlanLimit?.(e.feature);
        return;
      }
      toast(e instanceof Error ? e.message : "Could not create project", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Create project"
      description="Set the rate once and every tracked hour bills correctly."
      onClose={onClose}
    >
      <div className="space-y-4">
        <Field label="Project name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Website redesign"
            required
          />
        </Field>
        <Field label="Client">
          <Select value={creatingClient && !clients.length ? NEW_CLIENT : clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value={NEW_CLIENT}>+ New client</option>
          </Select>
        </Field>
        {creatingClient ? (
          <Field label="Client name">
            <Input
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Mr David"
            />
          </Field>
        ) : null}
        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Scope, deliverables, or notes"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hourly rate">
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </Field>
          <Field label="Billing type">
            <Select
              value={billingType}
              onChange={(e) => setBillingType(e.target.value as "hourly" | "fixed")}
            >
              <option value="hourly">Hourly</option>
              <option value="fixed">Fixed</option>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="End date">
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Color">
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Use color ${c}`}
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-lg transition ${
                  color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </Field>
        <p className="text-xs text-text-secondary">
          {projects.length} project{projects.length === 1 ? "" : "s"} on your {profile?.plan ?? "free"} plan.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!canSubmit} onClick={submit}>
            {busy ? "Creating…" : "Create project"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
