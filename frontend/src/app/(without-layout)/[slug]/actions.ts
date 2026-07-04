"use server";

import { backendFetch, readError } from "@/lib/backend";

export interface SubmitState {
  ok?: boolean;
  error?: string;
  message?: string;
  status?: string;
}

export async function submitLeadAction(
  slug: string,
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !email || !phone) {
    return { error: "Name, email and phone are all required." };
  }

  const res = await backendFetch(`/api/public/forms/${slug}/leads`, {
    auth: false,
    forwardIp: true,
    method: "POST",
    body: JSON.stringify({ name, email, phone }),
  });

  if (!res.ok) {
    return { error: await readError(res) };
  }

  const data = (await res.json()) as {
    message?: string;
    lead?: { status?: string };
  };
  return { ok: true, message: data.message, status: data.lead?.status };
}
