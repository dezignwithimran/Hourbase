"use client";

import { Button } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/feedback";
import { ProBadge } from "@/components/ui/pro-badge";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { Users } from "@/components/ui/icons";
import { isPaidPlan } from "@/lib/billing";
import { uid, nowIso } from "@/lib/store/helpers";
import { useStore } from "@/lib/store/provider";
import { toast } from "@/components/ui/toast";
import type { TeamRole } from "@/lib/types";
import { useState } from "react";

export default function TeamPage() {
  const { profile, updateProfile } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("collaborator");
  const [upgrade, setUpgrade] = useState(false);
  const paid = isPaidPlan(profile?.plan);
  const members = profile?.teamMembers ?? [];

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!paid) {
      setUpgrade(true);
      return;
    }
    const normalized = email.trim().toLowerCase();
    if (members.some((m) => m.email === normalized)) {
      toast("That person is already on the team", "error");
      return;
    }
    try {
      await updateProfile({
        teamMembers: [
          ...members,
          { id: uid(), name: name.trim(), email: normalized, role, createdAt: nowIso() },
        ],
      });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save team member", "error");
      return;
    }
    setName("");
    setEmail("");
    setRole("collaborator");
    toast("Team member added");
  }

  async function removeMember(id: string) {
    await updateProfile({ teamMembers: members.filter((m) => m.id !== id) });
    toast("Removed from team");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            Team workspace
            <ProBadge />
          </span>
        }
        description="Add collaborators you work with. Pro unlocks this workspace."
      />

      <Card>
        <h2 className="text-base font-semibold text-text">Add a member</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Keep accountants, contractors, or a studio partner next to your projects.
        </p>
        <form onSubmit={addMember} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Alex Rivera" />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="alex@studio.com"
            />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value as TeamRole)}>
              <option value="collaborator">Collaborator</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" className="w-full sm:w-auto">
              {paid ? "Add member" : "Unlock with Pro"}
            </Button>
          </div>
        </form>
      </Card>

      {members.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="No team members yet"
          description={paid ? "Add the first person you work with." : "Upgrade to Pro to keep a team list in this workspace."}
        />
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-border">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-text">{member.name}</p>
                  <p className="text-xs text-text-secondary">
                    {member.email} · {member.role === "admin" ? "Admin" : "Collaborator"}
                  </p>
                </div>
                {paid ? (
                  <Button variant="ghost" onClick={() => void removeMember(member.id)}>
                    Remove
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <UpgradeDialog open={upgrade} onClose={() => setUpgrade(false)} />
    </div>
  );
}
