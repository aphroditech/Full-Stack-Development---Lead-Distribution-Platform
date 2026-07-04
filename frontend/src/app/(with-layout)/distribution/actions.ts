"use server";

import { revalidatePath } from "next/cache";
import { backendFetch, readError } from "@/lib/backend";

export interface BrokerSettingInput {
  brokerId: string;
  percentage: number;
  active: boolean;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function createDistribution(
  brokers: BrokerSettingInput[],
): Promise<ActionResult> {
  const res = await backendFetch("/api/distribution", {
    method: "POST",
    body: JSON.stringify({ brokers }),
  });
  if (!res.ok) return { ok: false, error: await readError(res) };

  revalidatePath("/distribution");
  revalidatePath("/");
  return { ok: true };
}

export async function updateDistribution(
  brokers: BrokerSettingInput[],
): Promise<ActionResult> {
  const res = await backendFetch("/api/distribution/brokers", {
    method: "PUT",
    body: JSON.stringify({ brokers }),
  });
  if (!res.ok) return { ok: false, error: await readError(res) };

  revalidatePath("/distribution");
  revalidatePath("/");
  return { ok: true };
}
