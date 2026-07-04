"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, COOKIE_SECURE } from "./config";
import { backendFetch, readError } from "./backend";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const res = await backendFetch("/api/auth/login", {
    auth: false,
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return { error: await readError(res) };
  }

  const data = (await res.json()) as { token: string };
  (await cookies()).set(AUTH_COOKIE, data.token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/");
}

/**
 * Clear the admin session cookie. The caller (client) performs a full-page
 * navigation to /login afterwards — a hard load guarantees the login page is
 * freshly rendered and interactive (a soft router navigation after a server
 * action can leave the target client form un-hydrated until a manual refresh).
 */
export async function logoutAction(): Promise<void> {
  (await cookies()).delete(AUTH_COOKIE);
}
