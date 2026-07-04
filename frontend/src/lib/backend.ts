import { cookies, headers } from "next/headers";
import { AUTH_COOKIE, BACKEND_URL } from "./config";

interface FetchOpts extends RequestInit {
  /** Attach the admin JWT from the cookie (default: true). */
  auth?: boolean;
  /** Forward the visitor's IP to the backend via X-Forwarded-For (for public submits). */
  forwardIp?: boolean;
}

/**
 * Server-side fetch to the private backend. Runs only on the Next.js server,
 * so the browser never talks to the backend directly (BFF pattern).
 */
export async function backendFetch(path: string, opts: FetchOpts = {}): Promise<Response> {
  const { auth = true, forwardIp = false, headers: initHeaders, ...rest } = opts;
  const h = new Headers(initHeaders);

  if (rest.body && !h.has("content-type")) {
    h.set("content-type", "application/json");
  }

  if (auth) {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    if (token) h.set("authorization", `Bearer ${token}`);
  }

  if (forwardIp) {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for") || hdrs.get("x-real-ip") || "";
    if (ip) h.set("x-forwarded-for", ip);
  }

  return fetch(`${BACKEND_URL}${path}`, { ...rest, headers: h, cache: "no-store" });
}

/** Fetch + parse JSON, throwing the backend's error message on non-2xx. */
export async function backendJSON<T>(path: string, opts?: FetchOpts): Promise<T> {
  const res = await backendFetch(path, opts);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

/** Extract a human-readable error message from a backend Response. */
export async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.error?.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
