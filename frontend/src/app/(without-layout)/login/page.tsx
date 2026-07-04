import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-2 p-4 dark:bg-[#020d1a]">
      <div className="w-full max-w-md rounded-[10px] bg-white p-8 shadow-1 dark:bg-gray-dark">
        <h1 className="mb-1 text-2xl font-bold text-dark dark:text-white">Sign in</h1>
        <p className="mb-6 text-sm text-dark-5 dark:text-dark-6">
          Admin access to the Lead Distribution Platform
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
