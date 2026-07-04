import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// Public endpoint the visitor-facing form posts to. Forwards to the private
// backend, passing along the captured visitor IP (X-Forwarded-For).
export async function POST(req: Request) {
  let body: { slug?: string; name?: string; email?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid request body" } },
      { status: 400 },
    );
  }

  const { slug, name, email, phone } = body ?? {};
  if (!slug) {
    return NextResponse.json({ error: { message: "Missing form slug" } }, { status: 400 });
  }

  const res = await backendFetch(
    `/api/public/forms/${encodeURIComponent(slug)}/leads`,
    {
      auth: false,
      forwardIp: true,
      method: "POST",
      body: JSON.stringify({ name, email, phone }),
    },
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
