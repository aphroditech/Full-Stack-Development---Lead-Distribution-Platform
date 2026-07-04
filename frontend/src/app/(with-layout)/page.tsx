import Link from "next/link";
import type { Metadata } from "next";
import { backendJSON } from "@/lib/backend";
import type { DashboardStats, Lead } from "@/lib/api-types";
import { Card, PageHeader, StatusBadge } from "@/components/ui/display";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <Card className="p-4 md:p-5">
      <p className="text-sm text-dark-5 dark:text-dark-6">{label}</p>
      <p className="mt-2 text-2xl font-bold text-dark dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-dark-5 dark:text-dark-6">{sub}</p>}
    </Card>
  );
}

function ChecklistRow({ done, label, href, cta }: { done: boolean; label: string; href: string; cta: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-stroke py-3 last:border-0 dark:border-dark-3">
      <span className="flex items-center gap-2.5">
        <span
          className={
            done
              ? "flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-500/15"
          }
        >
          {done ? "✓" : "•"}
        </span>
        <span className="text-sm text-dark dark:text-white">{label}</span>
      </span>
      {!done && (
        <Link href={href} className="text-sm font-medium text-primary hover:underline">
          {cta}
        </Link>
      )}
    </li>
  );
}

export default async function DashboardPage() {
  const [{ stats }, { leads }] = await Promise.all([
    backendJSON<{ stats: DashboardStats }>("/api/dashboard/stats"),
    backendJSON<{ leads: Lead[] }>("/api/leads"),
  ]);

  const recent = leads.slice(0, 6);

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of brokers, leads and distribution." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Brokers"
          value={stats.brokers.total}
          sub={`${stats.brokers.active} active`}
        />
        <StatCard label="Total leads" value={stats.leads.total} />
        <StatCard label="Sent" value={stats.leads.sent} />
        <StatCard label="Unsent" value={stats.leads.unsent} />
        <StatCard label="Duplicate" value={stats.leads.duplicate} />
        <StatCard label="Failed" value={stats.leads.failed} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-2 text-lg font-semibold text-dark dark:text-white">Setup</h2>
          <ul>
            <ChecklistRow done={stats.hasForm} label="Create the lead form" href="/form" cta="Create" />
            <ChecklistRow
              done={stats.hasDistribution}
              label="Create the distribution"
              href="/distribution"
              cta="Create"
            />
            <ChecklistRow
              done={stats.brokers.total > 0}
              label="Add brokers"
              href="/brokers"
              cta="Add"
            />
          </ul>
          {stats.form && (
            <div className="mt-4 rounded-lg bg-gray-2 px-3 py-2.5 dark:bg-dark-2">
              <p className="text-xs text-dark-5 dark:text-dark-6">Public form URL</p>
              <p className="mt-0.5 break-all text-sm font-medium text-primary">/{stats.form.slug}</p>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark dark:text-white">Recent leads</h2>
            <Link href="/leads" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-dark-5 dark:text-dark-6">No leads yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-dark-5 dark:text-dark-6">
                  <tr className="border-b border-stroke dark:border-dark-3">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Broker</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((lead) => (
                    <tr key={lead.id} className="border-b border-stroke last:border-0 dark:border-dark-3">
                      <td className="py-2.5 pr-4 text-dark dark:text-white">{lead.name}</td>
                      <td className="py-2.5 pr-4 text-dark-5 dark:text-dark-6">
                        {lead.broker?.name ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="py-2.5 text-dark-5 dark:text-dark-6">
                        {formatDateTime(lead.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
