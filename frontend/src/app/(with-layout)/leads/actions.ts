"use server";

import { revalidatePath } from "next/cache";
import { backendFetch, readError } from "@/lib/backend";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function assignLead(leadId: string, brokerId: string): Promise<ActionResult> {
  const res = await backendFetch(`/api/leads/${leadId}/assign`, {
    method: "POST",
    body: JSON.stringify({ brokerId }),
  });
  if (!res.ok) return { ok: false, error: await readError(res) };

  revalidatePath("/leads");
  revalidatePath("/distribution");
  revalidatePath("/");
  return { ok: true };
}
