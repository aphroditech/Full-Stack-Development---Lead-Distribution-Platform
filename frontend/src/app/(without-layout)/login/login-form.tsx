"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/auth-actions";
import { Field, Input, SubmitButton } from "@/components/ui/form";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@example.com"
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </Field>

      {state.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      <SubmitButton pendingLabel="Signing in..." className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
