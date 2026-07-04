"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Broker, DistributionBrokerSetting } from "@/lib/api-types";
import { Card } from "@/components/ui/display";
import { Button, Input, Toggle } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  createDistribution,
  updateDistribution,
  type BrokerSettingInput,
} from "./actions";

interface RowState {
  included: boolean;
  percentage: string;
  active: boolean;
}

export function DistributionEditor({
  brokers,
  existing,
  mode,
}: {
  brokers: Broker[];
  existing?: DistributionBrokerSetting[];
  mode: "create" | "manage";
}) {
  const router = useRouter();

  const [rows, setRows] = useState<Record<string, RowState>>(() => {
    const init: Record<string, RowState> = {};
    for (const b of brokers) {
      const ex = existing?.find((e) => e.brokerId === b.id);
      init[b.id] = {
        included: Boolean(ex),
        percentage: String(ex?.percentage ?? 0),
        active: ex?.active ?? true,
      };
    }
    return init;
  });

  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function update(id: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  const totalPercentage = useMemo(
    () =>
      Object.entries(rows)
        .filter(([, r]) => r.included)
        .reduce((sum, [, r]) => sum + (parseFloat(r.percentage) || 0), 0),
    [rows],
  );

  async function handleSave() {
    setError(undefined);

    const selected: BrokerSettingInput[] = [];
    for (const b of brokers) {
      const r = rows[b.id];
      if (!r.included) continue;
      const pct = parseFloat(r.percentage);
      if (Number.isNaN(pct) || pct < 0 || pct > 100) {
        return setError(`Percentage for "${b.name}" must be between 0 and 100.`);
      }
      selected.push({ brokerId: b.id, percentage: pct, active: r.active });
    }

    if (mode === "create" && selected.length === 0) {
      return setError("Select at least one broker for the distribution.");
    }

    setSaving(true);
    const res =
      mode === "create"
        ? await createDistribution(selected)
        : await updateDistribution(selected);
    setSaving(false);

    if (!res.ok) return setError(res.error ?? "Failed to save distribution.");
    router.refresh();
  }

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-stroke px-5 py-4 dark:border-dark-3">
        <div>
          <h2 className="font-semibold text-dark dark:text-white">Brokers in distribution</h2>
          <p className="text-sm text-dark-5 dark:text-dark-6">
            Choose brokers and set each broker&apos;s share percentage.
          </p>
        </div>
        <span
          className={cn(
            "text-sm font-medium",
            Math.round(totalPercentage) === 100
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-dark-5 dark:text-dark-6",
          )}
        >
          Total: {totalPercentage}%
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-dark-5 dark:text-dark-6">
            <tr className="border-b border-stroke dark:border-dark-3">
              <th className="px-5 py-3 font-medium">Include</th>
              <th className="px-5 py-3 font-medium">Broker</th>
              <th className="px-5 py-3 font-medium">Percentage</th>
              <th className="px-5 py-3 font-medium">Active in distribution</th>
            </tr>
          </thead>
          <tbody>
            {brokers.map((b) => {
              const r = rows[b.id];
              return (
                <tr
                  key={b.id}
                  className="border-b border-stroke last:border-0 dark:border-dark-3"
                >
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={r.included}
                      onChange={(e) => update(b.id, { included: e.target.checked })}
                      className="size-4 accent-primary"
                    />
                  </td>
                  <td className="px-5 py-3 font-medium text-dark dark:text-white">
                    {b.name}
                    {!b.active && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                        (globally inactive)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={r.percentage}
                        disabled={!r.included}
                        onChange={(e) => update(b.id, { percentage: e.target.value })}
                        className="w-24"
                      />
                      <span className="text-dark-5 dark:text-dark-6">%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Toggle
                      checked={r.active}
                      onChange={(v) => update(b.id, { active: v })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 border-t border-stroke px-5 py-4 dark:border-dark-3">
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving
            ? "Saving..."
            : mode === "create"
              ? "Create distribution"
              : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}
