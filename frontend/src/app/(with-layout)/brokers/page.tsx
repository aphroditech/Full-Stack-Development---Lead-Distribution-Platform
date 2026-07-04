import type { Metadata } from "next";
import { backendJSON } from "@/lib/backend";
import type { Broker } from "@/lib/api-types";
import { BrokersClient } from "./brokers-client";

export const metadata: Metadata = { title: "Brokers" };

export default async function BrokersPage() {
  const { brokers } = await backendJSON<{ brokers: Broker[] }>("/api/brokers");
  return <BrokersClient brokers={brokers} />;
}
