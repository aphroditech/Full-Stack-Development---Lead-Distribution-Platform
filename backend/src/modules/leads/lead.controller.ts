import type { RequestHandler } from "express";
import type { LeadStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { serializeLead } from "../../utils/serialize";
import { manuallyAssignLead } from "../../services/distribution.service";
import { leadStatusValues } from "./lead.schema";

const brokerSelect = { broker: { select: { id: true, name: true } } };

export const listLeads: RequestHandler = async (req, res) => {
  const status = req.query.status as string | undefined;
  const where =
    status && (leadStatusValues as readonly string[]).includes(status)
      ? { status: status as LeadStatus }
      : {};

  const leads = await prisma.lead.findMany({
    where,
    include: brokerSelect,
    orderBy: { createdAt: "desc" },
  });

  res.json({ leads: leads.map(serializeLead) });
};

export const assignLead: RequestHandler = async (req, res) => {
  const { brokerId } = req.body as { brokerId: string };
  const lead = await manuallyAssignLead(req.params.id, brokerId);
  const withBroker = await prisma.lead.findUnique({
    where: { id: lead.id },
    include: brokerSelect,
  });
  res.json({ lead: serializeLead(withBroker!) });
};
