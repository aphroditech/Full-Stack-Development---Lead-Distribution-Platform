import type { Metadata } from "next";
import { backendJSON } from "@/lib/backend";
import type { Broker, Lead } from "@/lib/api-types";
import { PageHeader } from "@/components/ui/display";
import { LeadsTable } from "@/components/leads-table";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const [{ leads }, { brokers }] = await Promise.all([
    backendJSON<{ leads: Lead[] }>("/api/leads"),
    backendJSON<{ brokers: Broker[] }>("/api/brokers"),
  ]);

  return (
    <>
      <PageHeader
        title="Leads"
        description="All submitted leads. Unsent leads can be manually assigned to a broker."
      />
      <LeadsTable leads={leads} brokers={brokers} canAssign showFilter />
    </>
  );
}
