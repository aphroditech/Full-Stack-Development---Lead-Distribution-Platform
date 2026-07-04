import Link from "next/link";
import type { Metadata } from "next";
import { backendJSON } from "@/lib/backend";
import type { FormInfo } from "@/lib/api-types";
import { Badge, Card, PageHeader } from "@/components/ui/display";
import { formatDate } from "@/lib/format";
import { CreateForm } from "./create-form";

export const metadata: Metadata = { title: "Lead Form" };

export default async function FormPage() {
  const { form } = await backendJSON<{ form: FormInfo | null }>("/api/form");

  return (
    <>
      <PageHeader
        title="Lead Form"
        description="The single public lead form. Only one form can be created."
      />

      {!form ? (
        <CreateForm />
      ) : (
        <Card className="max-w-xl">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-dark dark:text-white">{form.name}</h2>
            <Badge tone="success">Created</Badge>
          </div>

          <dl className="space-y-2.5">
            <div className="flex justify-between border-b border-stroke py-2 dark:border-dark-3">
              <dt className="text-sm text-dark-5 dark:text-dark-6">Public URL</dt>
              <dd>
                <Link href={`/${form.slug}`} target="_blank" className="text-sm font-medium text-primary hover:underline">
                  /{form.slug}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between border-b border-stroke py-2 dark:border-dark-3">
              <dt className="text-sm text-dark-5 dark:text-dark-6">Created</dt>
              <dd className="text-sm font-medium text-dark dark:text-white">
                {formatDate(form.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-sm text-dark-5 dark:text-dark-6">Distribution</dt>
              <dd className="text-sm font-medium text-dark dark:text-white">
                {form.hasDistribution ? (
                  <Link href="/distribution" className="text-primary hover:underline">
                    Configured
                  </Link>
                ) : (
                  <Link href="/distribution" className="text-primary hover:underline">
                    Not set up — create it
                  </Link>
                )}
              </dd>
            </div>
          </dl>

          <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Only one form can exist, so creating another is disabled.
          </p>
        </Card>
      )}
    </>
  );
}
