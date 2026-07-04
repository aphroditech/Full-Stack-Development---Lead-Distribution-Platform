import type { RequestHandler } from "express";
import type { Form } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { slugify } from "../../utils/slug";

// Slugs that would collide with admin/frontend routes.
const RESERVED_SLUGS = new Set([
  "login",
  "brokers",
  "form",
  "distribution",
  "leads",
  "api",
  "dashboard",
]);

function serializeForm(form: Form & { distribution?: { id: string } | null }) {
  return {
    id: form.id,
    name: form.name,
    slug: form.slug,
    createdAt: form.createdAt,
    hasDistribution: form.distribution ? true : false,
  };
}

export const getForm: RequestHandler = async (_req, res) => {
  const form = await prisma.form.findFirst({ include: { distribution: true } });
  res.json({ form: form ? serializeForm(form) : null });
};

export const createForm: RequestHandler = async (req, res) => {
  // Only one form may exist.
  const existing = await prisma.form.findFirst();
  if (existing) {
    throw HttpError.conflict(
      "A form already exists. Only one form can be created.",
      "FORM_EXISTS",
    );
  }

  const { name } = req.body as { name: string; slug?: string };
  const slug = (req.body.slug as string | undefined) || slugify(name);
  if (!slug) {
    throw HttpError.badRequest(
      "Could not derive a URL slug from the form name — please provide one.",
      "INVALID_SLUG",
    );
  }
  if (RESERVED_SLUGS.has(slug)) {
    throw HttpError.badRequest(
      `The slug "${slug}" is reserved. Please choose a different one.`,
      "RESERVED_SLUG",
    );
  }

  const form = await prisma.form.create({ data: { name, slug } });
  res.status(201).json({ form: serializeForm(form) });
};
