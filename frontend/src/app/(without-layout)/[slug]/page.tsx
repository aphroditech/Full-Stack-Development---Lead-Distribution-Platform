import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { backendFetch } from "@/lib/backend";
import { PublicLeadForm } from "./public-lead-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await backendFetch(`/api/public/forms/${slug}`, { auth: false });
  if (!res.ok) return { title: "Form not found" };
  const { form } = (await res.json()) as { form: { name: string } };
  return { title: form.name };
}

export default async function PublicFormPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await backendFetch(`/api/public/forms/${slug}`, { auth: false });
  if (!res.ok) notFound();
  const { form } = (await res.json()) as { form: { id: string; name: string; slug: string } };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-2 p-4 dark:bg-[#020d1a]">
      <div className="w-full max-w-md rounded-[10px] bg-white p-8 shadow-1 dark:bg-gray-dark">
        <h1 className="mb-1 text-2xl font-bold text-dark dark:text-white">{form.name}</h1>
        <p className="mb-6 text-sm text-dark-5 dark:text-dark-6">
          Please fill in your details and we&apos;ll be in touch.
        </p>
        <PublicLeadForm slug={form.slug} />
      </div>
    </div>
  );
}
