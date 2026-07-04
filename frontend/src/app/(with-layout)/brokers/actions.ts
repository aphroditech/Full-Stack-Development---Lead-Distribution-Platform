"use server";

import { revalidatePath } from "next/cache";
import { backendFetch, readError } from "@/lib/backend";

export interface BrokerInput {
  name: string;
  active: boolean;
  dailyCap: number;
  timezone: string;
  openingTime: string;
  closingTime: string;
  workingDays: number[];
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function createBroker(input: BrokerInput): Promise<ActionResult> {
  const res = await backendFetch("/api/brokers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) return { ok: false, error: await readError(res) };
  revalidatePath("/brokers");
  revalidatePath("/");
  return { ok: true };
}

export async function updateBroker(id: string, input: BrokerInput): Promise<ActionResult> {
  const res = await backendFetch(`/api/brokers/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) return { ok: false, error: await readError(res) };
  revalidatePath("/brokers");
  revalidatePath(`/brokers/${id}`);
  return { ok: true };
}

export async function deleteBroker(id: string): Promise<ActionResult> {
  const res = await backendFetch(`/api/brokers/${id}`, { method: "DELETE" });
  if (!res.ok) return { ok: false, error: await readError(res) };
  revalidatePath("/brokers");
  revalidatePath("/");
  return { ok: true };
}
