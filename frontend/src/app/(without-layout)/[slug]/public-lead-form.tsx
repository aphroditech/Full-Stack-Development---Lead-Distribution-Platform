"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Input } from "@/components/ui/form";

export function PublicLeadForm({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<{ status?: string; message?: string } | null>(null);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email and phone are all required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/public/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, name, email, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Something went wrong. Please try again.");
      } else {
        setResult({ status: data?.lead?.status, message: data?.message });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const isDuplicate = result.status === "duplicate";
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
        <p className="mt-1 text-sm">{result.message ?? "Your details have been received."}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Full name" htmlFor="name">
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
        />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
      </Field>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
