"use client";

import { useState, type FormEvent } from "react";
import type { Broker } from "@/lib/api-types";
import { createBroker, updateBroker, type BrokerInput } from "./actions";
import { Button, Field, Input, Select, Toggle } from "@/components/ui/form";
import { WORLD_TIMEZONES, WEEKDAYS } from "@/lib/timezones";
import { cn } from "@/lib/utils";

export function BrokerForm({
  broker,
  onClose,
  onSaved,
}: {
  broker?: Broker;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(broker?.name ?? "");
  const [active, setActive] = useState(broker?.active ?? true);
  const [dailyCap, setDailyCap] = useState(String(broker?.dailyCap ?? 10));
  const [timezone, setTimezone] = useState(broker?.timezone ?? "Asia/Manila");
  const [openingTime, setOpeningTime] = useState(broker?.openingTime ?? "09:00");
  const [closingTime, setClosingTime] = useState(broker?.closingTime ?? "18:00");
  const [workingDays, setWorkingDays] = useState<number[]>(
    broker?.workingDays ?? [1, 2, 3, 4, 5],
  );
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  // Show the broker's current timezone even if it isn't in the curated list.
  const timezoneOptions = WORLD_TIMEZONES.some((tz) => tz.value === timezone)
    ? WORLD_TIMEZONES
    : [{ value: timezone, label: timezone }, ...WORLD_TIMEZONES];

  function toggleDay(d: number) {
    setWorkingDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);

    const cap = parseInt(dailyCap, 10);
    if (!name.trim()) return setError("Name is required.");
    if (!Number.isInteger(cap) || cap < 1) return setError("Daily cap must be at least 1.");
    if (workingDays.length === 0) return setError("Select at least one working day.");

    const input: BrokerInput = {
      name: name.trim(),
      active,
      dailyCap: cap,
      timezone,
      openingTime,
      closingTime,
      workingDays,
    };

    setSaving(true);
    const res = broker ? await updateBroker(broker.id, input) : await createBroker(input);
    setSaving(false);

    if (!res.ok) return setError(res.error ?? "Failed to save broker.");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Broker name" htmlFor="broker-name">
        <Input
          id="broker-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Brokerage"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Daily cap" htmlFor="broker-cap">
          <Input
            id="broker-cap"
            type="number"
            min={1}
            value={dailyCap}
            onChange={(e) => setDailyCap(e.target.value)}
          />
        </Field>
        <Field label="Timezone" htmlFor="broker-tz">
          <Select
            id="broker-tz"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {timezoneOptions.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Opening time" htmlFor="broker-open">
          <Input
            id="broker-open"
            type="time"
            value={openingTime}
            onChange={(e) => setOpeningTime(e.target.value)}
          />
        </Field>
        <Field label="Closing time" htmlFor="broker-close">
          <Input
            id="broker-close"
            type="time"
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Working days">
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => {
            const selected = workingDays.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition",
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-stroke text-dark hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3",
                )}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Status">
        <Toggle checked={active} onChange={setActive} label={active ? "Active" : "Inactive"} />
      </Field>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : broker ? "Save changes" : "Create broker"}
        </Button>
      </div>
    </form>
  );
}
