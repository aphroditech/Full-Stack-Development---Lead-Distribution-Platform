import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { backendFetch } from "@/lib/backend";
import type { Broker, Lead } from "@/lib/api-types";
import { Badge, Card, PageHeader } from "@/components/ui/display";
import { LeadsTable } from "@/components/leads-table";
import { formatWorkingDays } from "@/lib/timezones";

export const metadata: Metadata = { title: "Broker" };

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stroke py-2.5 last:border-0 dark:border-dark-3">
      <span className="text-sm text-dark-5 dark:text-dark-6">{label}</span>
      <span className="text-sm font-medium text-dark dark:text-white">{value}</span>
    </div>
  );
}

export default async function BrokerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await backendFetch(`/api/brokers/${id}`);
  if (!res.ok) notFound();
  const { broker, leads } = (await res.json()) as { broker: Broker; leads: Lead[] };

  return (
    <>
      <PageHeader
        title={broker.name}
        description="Leads received by this broker."
        action={
          <Link href="/brokers" className="text-sm font-medium text-primary hover:underline">
            ← Back to brokers
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-3 text-lg font-semibold text-dark dark:text-white">Details</h2>
          <InfoRow
            label="Status"
            value={<Badge tone={broker.active ? "success" : "neutral"}>{broker.active ? "Active" : "Inactive"}</Badge>}
          />
          <InfoRow label="Daily cap" value={broker.dailyCap} />
          <InfoRow label="Timezone" value={broker.timezone} />
          <InfoRow label="Open hours" value={`${broker.openingTime} – ${broker.closingTime}`} />
          <InfoRow label="Working days" value={formatWorkingDays(broker.workingDays)} />
          <InfoRow label="Total leads" value={leads.length} />
        </Card>

        <div className="lg:col-span-2">
          <LeadsTable leads={leads} />
        </div>
      </div>
    </>
  );
}
