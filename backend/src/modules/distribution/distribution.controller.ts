import type { RequestHandler } from "express";
import type { Broker, Distribution, DistributionBroker, Form } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { serializeBroker } from "../../utils/serialize";
import { getDistributionStandings } from "../../services/distribution.service";
import type { BrokerSetting } from "./distribution.schema";

type FullDistribution = Distribution & {
  form: Form | null;
  brokers: (DistributionBroker & { broker: Broker | null })[];
};

function serializeDistribution(d: FullDistribution) {
  return {
    id: d.id,
    formId: d.formId,
    form: d.form ? { id: d.form.id, name: d.form.name, slug: d.form.slug } : null,
    createdAt: d.createdAt,
    brokers: d.brokers.map((db) => ({
      id: db.id,
      brokerId: db.brokerId,
      percentage: db.percentage,
      active: db.active,
      broker: db.broker ? serializeBroker(db.broker) : null,
    })),
  };
}

const distributionInclude = {
  form: true,
  brokers: { include: { broker: true }, orderBy: { createdAt: "asc" as const } },
};

async function leadStats() {
  const [total, sent, unsent, duplicate, failed] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "sent" } }),
    prisma.lead.count({ where: { status: "unsent" } }),
    prisma.lead.count({ where: { status: "duplicate" } }),
    prisma.lead.count({ where: { status: "failed" } }),
  ]);
  return { total, sent, unsent, duplicate, failed };
}

export const getDistribution: RequestHandler = async (_req, res) => {
  const distribution = await prisma.distribution.findFirst({ include: distributionInclude });
  res.json({
    distribution: distribution ? serializeDistribution(distribution) : null,
    leadStats: await leadStats(),
  });
};

export const getStandings: RequestHandler = async (_req, res) => {
  res.json({ standings: await getDistributionStandings() });
};

export const createDistribution: RequestHandler = async (req, res) => {
  // A distribution cannot be created if no form exists yet.
  const form = await prisma.form.findFirst();
  if (!form) {
    throw HttpError.badRequest("Oops, please create a form first.", "NO_FORM");
  }

  // Only one distribution may exist.
  const existing = await prisma.distribution.findFirst();
  if (existing) {
    throw HttpError.conflict(
      "A distribution already exists. Only one distribution can be created.",
      "DISTRIBUTION_EXISTS",
    );
  }

  const brokers = req.body.brokers as BrokerSetting[];
  await assertBrokersExist(brokers.map((b) => b.brokerId));

  const distribution = await prisma.distribution.create({
    data: {
      formId: form.id, // auto-bound to the one existing form
      brokers: {
        create: brokers.map((b) => ({
          brokerId: b.brokerId,
          percentage: b.percentage,
          active: b.active ?? true,
        })),
      },
    },
    include: distributionInclude,
  });

  res.status(201).json({ distribution: serializeDistribution(distribution) });
};

export const updateDistributionBrokers: RequestHandler = async (req, res) => {
  const distribution = await prisma.distribution.findFirst();
  if (!distribution) throw HttpError.notFound("No distribution exists yet.");

  const brokers = req.body.brokers as BrokerSetting[];
  const ids = brokers.map((b) => b.brokerId);
  await assertBrokersExist(ids);

  await prisma.$transaction([
    prisma.distributionBroker.deleteMany({
      where: {
        distributionId: distribution.id,
        ...(ids.length ? { brokerId: { notIn: ids } } : {}),
      },
    }),
    ...brokers.map((b) =>
      prisma.distributionBroker.upsert({
        where: {
          distributionId_brokerId: {
            distributionId: distribution.id,
            brokerId: b.brokerId,
          },
        },
        create: {
          distributionId: distribution.id,
          brokerId: b.brokerId,
          percentage: b.percentage,
          active: b.active ?? true,
        },
        update: { percentage: b.percentage, active: b.active ?? true },
      }),
    ),
  ]);

  const updated = await prisma.distribution.findFirst({ include: distributionInclude });
  res.json({ distribution: serializeDistribution(updated!) });
};

async function assertBrokersExist(ids: string[]) {
  if (ids.length === 0) return;
  const found = await prisma.broker.findMany({ where: { id: { in: ids } }, select: { id: true } });
  if (found.length !== new Set(ids).size) {
    throw HttpError.badRequest("One or more selected brokers do not exist.", "BROKER_NOT_FOUND");
  }
}
