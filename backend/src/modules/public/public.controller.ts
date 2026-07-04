import type { RequestHandler } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { processLead } from "../../services/distribution.service";
import { extractIp } from "../../utils/ip";

/** Public: fetch the form by slug so the visitor-facing page can render. */
export const getPublicForm: RequestHandler = async (req, res) => {
  const form = await prisma.form.findUnique({ where: { slug: req.params.slug } });
  if (!form) throw HttpError.notFound("Form not found");
  res.json({ form: { id: form.id, name: form.name, slug: form.slug } });
};

/** Public: submit a lead. Captures IP, runs duplicate check + distribution logic. */
export const submitLead: RequestHandler = async (req, res) => {
  const form = await prisma.form.findUnique({ where: { slug: req.params.slug } });
  if (!form) throw HttpError.notFound("Form not found");

  const { name, email, phone } = req.body as {
    name: string;
    email: string;
    phone: string;
  };

  const lead = await processLead({
    name,
    email,
    phone,
    ipAddress: extractIp(req),
  });

  res.status(201).json({
    lead: { id: lead.id, status: lead.status },
    message:
      lead.status === "duplicate"
        ? "This email has already been registered."
        : "Thank you! Your details have been received.",
  });
};
