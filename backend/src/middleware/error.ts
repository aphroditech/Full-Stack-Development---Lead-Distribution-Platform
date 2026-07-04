import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { message: "Route not found", code: "NOT_FOUND" } });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.flatten().fieldErrors,
      },
    });
  }

  if (err instanceof HttpError) {
    return res
      .status(err.status)
      .json({ error: { message: err.message, code: err.code } });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: { message: "A record with this value already exists", code: "DUPLICATE" },
      });
    }
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ error: { message: "Record not found", code: "NOT_FOUND" } });
    }
  }

  console.error("Unhandled error:", err);
  return res
    .status(500)
    .json({ error: { message: "Internal server error", code: "INTERNAL" } });
};
