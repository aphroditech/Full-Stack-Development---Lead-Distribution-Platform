import type { RequestHandler } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { serializeBroker, serializeLead } from "../../utils/serialize";
import { dayRangeInZone } from "../../services/time.service";

export const listBrokers: RequestHandler = async (_req, res) => {
  const brokers = await prisma.broker.findMany({ orderBy: { createdAt: "asc" } });

  // Attach today's sent count (per broker timezone) + total leads for the list view.
  const enriched = await Promise.all(
    brokers.map(async (b) => {
      const { start, end } = dayRangeInZone(b.timezone);
      const [sentToday, totalLeads] = await Promise.all([
        prisma.lead.count({
          where: { assignedBrokerId: b.id, status: "sent", assignedAt: { gte: start, lte: end } },
        }),
        prisma.lead.count({ where: { assignedBrokerId: b.id } }),
      ]);
      return { ...serializeBroker(b), sentToday, totalLeads };
    }),
  );

  res.json({ brokers: enriched });
};

export const getBroker: RequestHandler = async (req, res) => {
  const broker = await prisma.broker.findUnique({
    where: { id: req.params.id },
    include: {
      leads: {
        include: { broker: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!broker) throw HttpError.notFound("Broker not found");

  const { leads, ...rest } = broker;
  res.json({ broker: serializeBroker(rest), leads: leads.map(serializeLead) });
};

export const createBroker: RequestHandler = async (req, res) => {
  const data = req.body as import("./broker.schema").BrokerCreateInput;
  const broker = await prisma.broker.create({
    data: {
      name: data.name,
      active: data.active ?? true,
      dailyCap: data.dailyCap,
      timezone: data.timezone,
      openingTime: data.openingTime,
      closingTime: data.closingTime,
      workingDays: [...data.workingDays].sort((a, b) => a - b).join(","),
    },
  });
  res.status(201).json({ broker: serializeBroker(broker) });
};

export const updateBroker: RequestHandler = async (req, res) => {
  const body = req.body as Partial<import("./broker.schema").BrokerCreateInput>;
  const data: Record<string, unknown> = { ...body };
  if (Array.isArray(body.workingDays)) {
    data.workingDays = [...body.workingDays].sort((a, b) => a - b).join(",");
  }

  const broker = await prisma.broker.update({ where: { id: req.params.id }, data });
  res.json({ broker: serializeBroker(broker) });
};

export const deleteBroker: RequestHandler = async (req, res) => {
  await prisma.broker.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
