import type { RequestHandler } from "express";
import { verifyToken, type JwtPayload } from "../lib/jwt";
import { HttpError } from "../lib/http-error";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Requires a valid Bearer JWT. The frontend BFF forwards the admin token here. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw HttpError.unauthorized("Missing authentication token");
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    req.user = verifyToken(token);
  } catch {
    throw HttpError.unauthorized("Invalid or expired token");
  }
  next();
};
