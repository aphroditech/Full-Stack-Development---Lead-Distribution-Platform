import type { Request } from "express";

/**
 * Best-effort client IP. The backend is only called by the frontend BFF, which
 * forwards the real visitor IP via X-Forwarded-For / X-Real-IP.
 */
export function extractIp(req: Request): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  if (Array.isArray(xff) && xff.length > 0) {
    return xff[0].split(",")[0].trim();
  }
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real.length > 0) return real.trim();

  const raw = req.socket?.remoteAddress || req.ip || "unknown";
  return raw.replace(/^::ffff:/, "");
}
