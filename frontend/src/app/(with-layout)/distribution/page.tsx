import Link from "next/link";
import type { Metadata } from "next";
import { backendJSON } from "@/lib/backend";
import type {
  Broker,
  Distribution,
  DistributionStandings,
  FormInfo,
  LeadStats,
} from "@/lib/api-types";
import { Card, EmptyState, PageHeader } from "@/components/ui/display";
import { Button } from "@/components/ui/form";
import { DistributionEditor } from "./distribution-editor";
import { DistributionStandingsTable } from "./distribution-standings";

export const metadata: Metadata = { title: "Distribution" };

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-dark-5 dark:text-dark-6">{label}</p>
      <p className="mt-1 text-xl font-bold text-dark dark:text-white">{value}</p>
    </Card>
  );
}

export default async function DistributionPage() {
  const [{ distribution, leadStats }, { form }, { brokers }, { standings }] =
    await Promise.all([
      backendJSON<{ distribution: Distribution | null; leadStats: LeadStats }>(
        "/api/distribution",
      ),
      backendJSON<{ form: FormInfo | null }>("/api/form"),
      backendJSON<{ brokers: Broker[] }>("/api/brokers"),
      backendJSON<{ standings: DistributionStandings | null }>(
        "/api/distribution/standings",
      ),
    ]);

  return (
    <>
      <PageHeader
        title="Distribution"
        description="One distribution, automatically bound to the form."
        action={
          distribution ? (
            <Link
              href="/distribution/detail"
              className="text-sm font-medium text-primary hover:underline"
            >
              View detail →
            </Link>
          ) : undefined
        }
      />

      {!form ? (
        <Card className="max-w-xl">
          <div className="rounded-lg bg-amber-50 px-4 py-3 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <p className="font-semibold">Oops, please create a form first.</p>
            <p className="mt-1 text-sm">
              A distribution can only be created once the lead form exists.
            </p>
          </div>
          <div className="mt-4">
            <Link href="/form">
              <Button>Go to Lead Form</Button>
            </Link>
          </div>
        </Card>
      ) : !distribution ? (
        brokers.length === 0 ? (
          <EmptyState
            title="Add brokers first"
            description="Create at least one broker before setting up the distribution."
            action={
              <Link href="/brokers">
                <Button>Go to Brokers</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-dark-5 dark:text-dark-6">
              Creating a distribution will automatically bind it to the form{" "}
              <span className="font-medium text-dark dark:text-white">{form.name}</span>.
            </p>
            <DistributionEditor brokers={brokers} mode="create" />
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatPill label="Total leads" value={leadStats.total} />
            <StatPill label="Sent" value={leadStats.sent} />
            <StatPill label="Unsent" value={leadStats.unsent} />
            <StatPill label="Duplicate" value={leadStats.duplicate} />
            <StatPill label="Failed" value={leadStats.failed} />
          </div>
          <DistributionEditor
            brokers={brokers}
            existing={distribution.brokers}
            mode="manage"
          />
          {standings && <DistributionStandingsTable standings={standings} />}
        </div>
      )}
    </>
  );
}
