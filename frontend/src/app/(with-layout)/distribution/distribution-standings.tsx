import type { BrokerStanding, DistributionStandings, StandingStatus } from "@/lib/api-types";
import { Card } from "@/components/ui/display";
import { cn } from "@/lib/utils";

/** Format a number to at most 2 decimals, trimming trailing zeros (5.50 -> "5.5"). */
function fmt(n: number): string {
  return String(Math.round(n * 100) / 100);
}

/** Deficit with an explicit sign, e.g. "+1.5", "-0.8", "0". */
function fmtDeficit(n: number): string {
  const v = Math.round(n * 100) / 100;
  return v > 0 ? `+${fmt(v)}` : fmt(v);
}

const RESULT: Record<StandingStatus, { label: string; className: string }> = {
  next: {
    label: "Receives next lead",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  eligible: {
    label: "Eligible",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  },
  capped: {
    label: "Daily cap reached",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  closed: {
    label: "Outside open hours",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  },
  inactive: {
    label: "Inactive in distribution",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  },
};

function ResultBadge({ status }: { status: StandingStatus }) {
  const r = RESULT[status];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        r.className,
      )}
    >
      {r.label}
    </span>
  );
}

export function DistributionStandingsTable({
  standings,
}: {
  standings: DistributionStandings;
}) {
  const { brokers, totalSentToday } = standings;

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stroke px-5 py-4 dark:border-dark-3">
        <div>
          <h2 className="font-semibold text-dark dark:text-white">Next-lead standings (today)</h2>
          <p className="text-sm text-dark-5 dark:text-dark-6">
            The eligible broker with the highest deficit receives the next lead.
          </p>
        </div>
        <span className="text-sm text-dark-5 dark:text-dark-6">
          Total sent today: <span className="font-medium text-dark dark:text-white">{totalSentToday}</span>
        </span>
      </div>

      {brokers.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-dark-5 dark:text-dark-6">
          No brokers in the distribution yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-dark-5 dark:text-dark-6">
              <tr className="border-b border-stroke dark:border-dark-3">
                <th className="px-5 py-3 font-medium">Broker</th>
                <th className="px-5 py-3 font-medium">Percentage</th>
                <th className="px-5 py-3 font-medium">Sent today</th>
                <th className="px-5 py-3 font-medium">Target after next lead</th>
                <th className="px-5 py-3 font-medium">Deficit</th>
                <th className="px-5 py-3 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((b: BrokerStanding) => (
                <tr
                  key={b.brokerId}
                  className={cn(
                    "border-b border-stroke last:border-0 dark:border-dark-3",
                    b.isNext && "bg-emerald-50/60 dark:bg-emerald-500/5",
                  )}
                >
                  <td className="px-5 py-3 font-medium text-dark dark:text-white">{b.name}</td>
                  <td className="px-5 py-3 text-dark-5 dark:text-dark-6">{b.percentage}%</td>
                  <td className="px-5 py-3 text-dark-5 dark:text-dark-6">
                    {b.sentToday}
                    <span className="text-dark-5/70 dark:text-dark-6/70"> / {b.dailyCap}</span>
                  </td>
                  <td className="px-5 py-3 text-dark-5 dark:text-dark-6">
                    {b.targetAfterLead === null ? "—" : fmt(b.targetAfterLead)}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 font-medium",
                      b.deficit === null
                        ? "text-dark-5 dark:text-dark-6"
                        : b.deficit >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {b.deficit === null ? "—" : fmtDeficit(b.deficit)}
                  </td>
                  <td className="px-5 py-3">
                    <ResultBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
