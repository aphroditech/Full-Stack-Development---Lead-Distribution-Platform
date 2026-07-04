"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Broker, Lead, LeadStatus } from "@/lib/api-types";
import { StatusBadge } from "@/components/ui/display";
import { Modal } from "@/components/ui/modal";
import { Button, Field, Select } from "@/components/ui/form";
import { assignLead } from "@/app/(with-layout)/leads/actions";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: ("all" | LeadStatus)[] = [
  "all",
  "sent",
  "unsent",
  "duplicate",
  "failed",
];

export function LeadsTable({
  leads,
  brokers = [],
  canAssign = false,
  showFilter = false,
}: {
  leads: Lead[];
  brokers?: Broker[];
  canAssign?: boolean;
  showFilter?: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [assigning, setAssigning] = useState<Lead | null>(null);
  const [brokerId, setBrokerId] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const rows = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  async function submitAssign() {
    if (!brokerId) return setError("Select a broker.");
    setSaving(true);
    setError(undefined);
    const res = await assignLead(assigning!.id, brokerId);
    setSaving(false);
    if (!res.ok) return setError(res.error ?? "Failed to assign lead.");
    setAssigning(null);
    setBrokerId("");
    router.refresh();
  }

  return (
    <>
      {showFilter && (
        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm capitalize transition",
                filter === s
                  ? "border-primary bg-primary text-white"
                  : "border-stroke text-dark hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-dark-5 dark:text-dark-6">
            <tr className="border-b border-stroke dark:border-dark-3">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">IP address</th>
              <th className="px-5 py-3 font-medium">Form</th>
              <th className="px-5 py-3 font-medium">Broker</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Received</th>
              {canAssign && <th className="px-5 py-3 text-right font-medium">Action</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={canAssign ? 9 : 8}
                  className="px-5 py-8 text-center text-dark-5 dark:text-dark-6"
                >
                  No leads to show.
                </td>
              </tr>
            ) : (
              rows.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-stroke last:border-0 dark:border-dark-3"
                >
                  <td className="px-5 py-3.5 font-medium text-dark dark:text-white">
                    {lead.name}
                  </td>
                  <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">{lead.email}</td>
                  <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">{lead.phone}</td>
                  <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">{lead.ipAddress}</td>
                  <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">{lead.formName}</td>
                  <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">
                    {lead.broker?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">
                    {formatDateTime(lead.assignedAt ?? lead.createdAt)}
                  </td>
                  {canAssign && (
                    <td className="px-5 py-3.5 text-right">
                      {lead.status === "unsent" || lead.status === "failed" ? (
                        <button
                          onClick={() => {
                            setAssigning(lead);
                            setError(undefined);
                            setBrokerId("");
                          }}
                          className="rounded-md px-2 py-1 text-sm font-medium text-primary hover:underline"
                        >
                          Assign
                        </button>
                      ) : (
                        <span className="text-dark-5 dark:text-dark-6">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={assigning !== null}
        onClose={() => setAssigning(null)}
        title="Assign lead to broker"
      >
        {assigning && (
          <div className="space-y-4">
            <p className="text-sm text-dark-5 dark:text-dark-6">
              Manually assign <span className="font-medium text-dark dark:text-white">{assigning.name}</span>{" "}
              ({assigning.email}) to a broker.
            </p>
            <Field label="Broker">
              <Select value={brokerId} onChange={(e) => setBrokerId(e.target.value)}>
                <option value="">Select a broker…</option>
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    {b.active ? "" : " (inactive)"}
                  </option>
                ))}
              </Select>
            </Field>
            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setAssigning(null)}>
                Cancel
              </Button>
              <Button onClick={submitAssign} disabled={saving}>
                {saving ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
