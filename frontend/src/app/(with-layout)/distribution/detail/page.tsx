import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { backendJSON } from "@/lib/backend";
import type {
  Broker,
  Distribution,
  DistributionStandings,
  Lead,
  LeadStats,
} from "@/lib/api-types";
import { Card, PageHeader } from "@/components/ui/display";
import { LeadsTable } from "@/components/leads-table";
import { DistributionStandingsTable } from "../distribution-standings";

export const metadata: Metadata = { title: "Distribution detail" };

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-dark-5 dark:text-dark-6">{label}</p>
      <p className="mt-1 text-xl font-bold text-dark dark:text-white">{value}</p>
    </Card>
  );
}

export default async function DistributionDetailPage() {
  const [{ distribution, leadStats }, { leads }, { brokers }, { standings }] =
    await Promise.all([
      backendJSON<{ distribution: Distribution | null; leadStats: LeadStats }>(
        "/api/distribution",
      ),
      backendJSON<{ leads: Lead[] }>("/api/leads"),
      backendJSON<{ brokers: Broker[] }>("/api/brokers"),
      backendJSON<{ standings: DistributionStandings | null }>(
        "/api/distribution/standings",
      ),
    ]);

  if (!distribution) redirect("/distribution");

  return (
    <>
      <PageHeader
        title="Distribution detail"
        description="Complete history of every lead that passed through the distribution."
        action={
          <Link href="/distribution" className="text-sm font-medium text-primary hover:underline">
            ← Back to distribution
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatPill label="Total leads" value={leadStats.total} />
        <StatPill label="Sent" value={leadStats.sent} />
        <StatPill label="Unsent" value={leadStats.unsent} />
        <StatPill label="Duplicate" value={leadStats.duplicate} />
        <StatPill label="Failed" value={leadStats.failed} />
      </div>

      {standings && (
        <div className="mb-6">
          <DistributionStandingsTable standings={standings} />
        </div>
      )}

      <LeadsTable leads={leads} brokers={brokers} canAssign showFilter />
    </>
  );
}
