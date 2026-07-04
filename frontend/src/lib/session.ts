import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "./config";
import { backendFetch } from "./backend";
import type { AdminUser } from "./api-types";

/** Resolve the currently logged-in admin, or null. Validates the JWT via the backend. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const res = await backendFetch("/api/auth/me");
  if (!res.ok) return null;

  const data = (await res.json()) as { user: AdminUser };
  return data.user;
}

/** Require an authenticated admin or redirect to the login page. */
export async function requireUser(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
