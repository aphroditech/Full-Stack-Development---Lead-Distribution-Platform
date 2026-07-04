// Internal URL of the private Express backend (never exposed to the browser).
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8170";

// Name of the httpOnly cookie that stores the admin JWT on the frontend origin.
export const AUTH_COOKIE = "ld_token";

export const isProd = process.env.NODE_ENV === "production";

// Whether to mark the auth cookie as `Secure`. Must be false when the app is
// served over plain HTTP (e.g. http://IP:PORT) — browsers silently drop
// `Secure` cookies on non-HTTPS origins, which would break login. Set
// COOKIE_SECURE=true only when the site is served over HTTPS.
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
