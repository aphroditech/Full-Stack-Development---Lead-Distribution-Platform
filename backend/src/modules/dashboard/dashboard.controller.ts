import type { RequestHandler } from "express";
import { prisma } from "../../lib/prisma";

export const getStats: RequestHandler = async (_req, res) => {
  const [
    totalBrokers,
    activeBrokers,
    form,
    distribution,
    total,
    sent,
    unsent,
    duplicate,
    failed,
  ] = await Promise.all([
    prisma.broker.count(),
    prisma.broker.count({ where: { active: true } }),
    prisma.form.findFirst({ select: { id: true, name: true, slug: true } }),
    prisma.distribution.findFirst({ select: { id: true } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "sent" } }),
    prisma.lead.count({ where: { status: "unsent" } }),
    prisma.lead.count({ where: { status: "duplicate" } }),
    prisma.lead.count({ where: { status: "failed" } }),
  ]);

  res.json({
    stats: {
      brokers: { total: totalBrokers, active: activeBrokers },
      hasForm: Boolean(form),
      hasDistribution: Boolean(distribution),
      form: form ?? null,
      leads: { total, sent, unsent, duplicate, failed },
    },
  });
};
