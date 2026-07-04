"use server";

import { revalidatePath } from "next/cache";
import { backendFetch, readError } from "@/lib/backend";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function createForm(input: {
  name: string;
  slug?: string;
}): Promise<ActionResult> {
  const res = await backendFetch("/api/form", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) return { ok: false, error: await readError(res) };

  revalidatePath("/form");
  revalidatePath("/");
  revalidatePath("/distribution");
  return { ok: true };
}
