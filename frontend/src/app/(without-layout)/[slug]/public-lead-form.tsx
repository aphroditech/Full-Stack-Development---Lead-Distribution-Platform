"use client";

import { useActionState } from "react";
import { submitLeadAction, type SubmitState } from "./actions";
import { Field, Input, SubmitButton } from "@/components/ui/form";

const initialState: SubmitState = {};

export function PublicLeadForm({ slug }: { slug: string }) {
  const action = submitLeadAction.bind(null, slug);
  const [state, formAction] = useActionState(action, initialState);

  if (state.ok) {
    const isDuplicate = state.status === "duplicate";
    return (
      <div
        className={
          isDuplicate
            ? "rounded-lg bg-amber-50 px-4 py-6 text-center text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
            : "rounded-lg bg-emerald-50 px-4 py-6 text-center text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
        }
      >
        <p className="text-lg font-semibold">
          {isDuplicate ? "Already registered" : "Thank you!"}
        </p>
        <p className="mt-1 text-sm">
          {state.message ?? "Your details have been received."}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Full name" htmlFor="name">
        <Input id="name" name="name" required placeholder="Jane Doe" />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" required placeholder="+1 555 123 4567" />
      </Field>

      {state.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      <SubmitButton pendingLabel="Submitting..." className="w-full">
        Submit
      </SubmitButton>
    </form>
  );
}
