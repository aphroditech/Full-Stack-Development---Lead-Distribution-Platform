"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createForm } from "./actions";
import { Card } from "@/components/ui/display";
import { Button, Field, Input } from "@/components/ui/form";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const effectiveSlug = slugTouched ? slugify(slug) : slugify(name);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (!name.trim()) return setError("Form name is required.");
    if (!effectiveSlug) return setError("Please provide a valid URL slug.");

    setSaving(true);
    const res = await createForm({ name: name.trim(), slug: effectiveSlug });
    setSaving(false);
    if (!res.ok) return setError(res.error ?? "Failed to create form.");
    router.refresh();
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Form name" htmlFor="form-name" hint="Shown to visitors on the public page.">
          <Input
            id="form-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lead Registration"
          />
        </Field>

        <Field
          label="Public URL slug"
          htmlFor="form-slug"
          hint="Lowercase letters, numbers and hyphens. Auto-generated from the name."
        >
          <Input
            id="form-slug"
            value={slugTouched ? slug : effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="lead-registration"
          />
        </Field>

        <div className="rounded-lg bg-gray-2 px-3 py-2.5 text-sm dark:bg-dark-2">
          <span className="text-dark-5 dark:text-dark-6">Public form URL: </span>
          <span className="font-medium text-primary">/{effectiveSlug || "your-slug"}</span>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create form"}
        </Button>
      </form>
    </Card>
  );
}
