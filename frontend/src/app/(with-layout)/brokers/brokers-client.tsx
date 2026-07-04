"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Broker } from "@/lib/api-types";
import { Button } from "@/components/ui/form";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/display";
import { Modal } from "@/components/ui/modal";
import { BrokerForm } from "./broker-form";
import { deleteBroker } from "./actions";
import { formatWorkingDays } from "@/lib/timezones";

export function BrokersClient({ brokers }: { brokers: Broker[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Broker | undefined>();
  const [busyId, setBusyId] = useState<string | null>(null);

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(b: Broker) {
    setEditing(b);
    setModalOpen(true);
  }

  function onSaved() {
    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete(b: Broker) {
    if (!confirm(`Delete broker "${b.name}"?`)) return;
    setBusyId(b.id);
    const res = await deleteBroker(b.id);
    setBusyId(null);
    if (!res.ok) {
      alert(res.error ?? "Failed to delete broker.");
      return;
    }
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="Brokers"
        description="Brokers that can receive leads. Many can be created."
        action={<Button onClick={openCreate}>+ Add broker</Button>}
      />

      {brokers.length === 0 ? (
        <EmptyState
          title="No brokers yet"
          description="Create your first broker to start distributing leads."
          action={<Button onClick={openCreate}>+ Add broker</Button>}
        />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="text-dark-5 dark:text-dark-6">
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Daily cap</th>
                  <th className="px-5 py-3 font-medium">Sent today</th>
                  <th className="px-5 py-3 font-medium">Timezone</th>
                  <th className="px-5 py-3 font-medium">Hours</th>
                  <th className="px-5 py-3 font-medium">Working days</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brokers.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-stroke last:border-0 dark:border-dark-3"
                  >
                    <td className="px-5 py-3.5 font-medium text-dark dark:text-white">
                      <Link href={`/brokers/${b.id}`} className="hover:text-primary">
                        {b.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={b.active ? "success" : "neutral"}>
                        {b.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">{b.dailyCap}</td>
                    <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">
                      {b.sentToday ?? 0}
                    </td>
                    <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">{b.timezone}</td>
                    <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">
                      {b.openingTime}–{b.closingTime}
                    </td>
                    <td className="px-5 py-3.5 text-dark-5 dark:text-dark-6">
                      {formatWorkingDays(b.workingDays)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/brokers/${b.id}`}
                          className="rounded-md px-2 py-1 text-sm font-medium text-primary hover:underline"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openEdit(b)}
                          className="rounded-md px-2 py-1 text-sm font-medium text-dark hover:underline dark:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          disabled={busyId === b.id}
                          className="rounded-md px-2 py-1 text-sm font-medium text-rose-600 hover:underline disabled:opacity-50"
                        >
                          {busyId === b.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit broker" : "Add broker"}
      >
        <BrokerForm broker={editing} onClose={() => setModalOpen(false)} onSaved={onSaved} />
      </Modal>
    </>
  );
}
