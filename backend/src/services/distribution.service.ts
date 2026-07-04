import { DateTime } from "luxon";
import type { Lead } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import { dayRangeInZone, isBrokerOpen } from "./time.service";
import { normalizeEmail, selectBroker } from "./distribution.logic";

async function countBrokerSentToday(brokerId: string, timezone: string): Promise<number> {
  const { start, end } = dayRangeInZone(timezone);
  return prisma.lead.count({
    where: {
      assignedBrokerId: brokerId,
      status: "sent",
      assignedAt: { gte: start, lte: end },
    },
  });
}

export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  ipAddress: string;
}

/**
 * Run the full distribution workflow for one submitted lead and persist the result.
 * Returns the created lead (with its final status and assignment).
 */
export async function processLead(input: LeadInput): Promise<Lead> {
  const email = normalizeEmail(input.email);

  const form = await prisma.form.findFirst({
    include: {
      distribution: {
        include: { brokers: { include: { broker: true } } },
      },
    },
  });

  const base = {
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    ipAddress: input.ipAddress,
    formId: form?.id ?? null,
    formName: form?.name ?? "",
  };

  // 1. Duplicate: email already assigned to any broker before.
  const priorAssigned = await prisma.lead.findFirst({
    where: { email, assignedBrokerId: { not: null } },
  });
  if (priorAssigned) {
    return prisma.lead.create({ data: { ...base, status: "duplicate" } });
  }

  // 2. No distribution => unsent.
  const distribution = form?.distribution;
  if (!distribution) {
    return prisma.lead.create({ data: { ...base, status: "unsent" } });
  }

  // 3. Candidate brokers: active in distribution AND globally active.
  const candidates = distribution.brokers.filter((db) => db.active && db.broker.active);

  const now = DateTime.now();
  const withCounts = await Promise.all(
    candidates.map(async (db) => ({
      db,
      sentToday: await countBrokerSentToday(db.brokerId, db.broker.timezone),
    })),
  );

  // Distribution-wide total sent today across all candidate brokers.
  const totalSentToday = withCounts.reduce((sum, c) => sum + c.sentToday, 0);

  // 4. Eligible = under daily cap AND currently open.
  const eligible = withCounts.filter(
    ({ db, sentToday }) =>
      sentToday < db.broker.dailyCap &&
      isBrokerOpen(
        {
          timezone: db.broker.timezone,
          openingTime: db.broker.openingTime,
          closingTime: db.broker.closingTime,
          workingDays: db.broker.workingDays,
        },
        now,
      ),
  );

  const selectedId = selectBroker(
    eligible.map(({ db, sentToday }) => ({
      brokerId: db.brokerId,
      percentage: db.percentage,
      sentToday,
    })),
    totalSentToday,
  );

  // 5. Assign or mark unsent.
  if (!selectedId) {
    return prisma.lead.create({ data: { ...base, status: "unsent" } });
  }

  return prisma.lead.create({
    data: {
      ...base,
      status: "sent",
      assignedBrokerId: selectedId,
      assignedAt: new Date(),
    },
  });
}

/** Manually assign an unsent (or failed) lead to a broker — an explicit admin override. */
export async function manuallyAssignLead(leadId: string, brokerId: string): Promise<Lead> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    throw HttpError.notFound("Lead not found");
  }
  if (lead.status === "sent" || lead.status === "duplicate") {
    throw HttpError.badRequest(
      `Lead cannot be manually assigned because its status is "${lead.status}"`,
      "INVALID_LEAD_STATUS",
    );
  }

  const broker = await prisma.broker.findUnique({ where: { id: brokerId } });
  if (!broker) {
    throw HttpError.badRequest("Selected broker does not exist", "BROKER_NOT_FOUND");
  }

  return prisma.lead.update({
    where: { id: leadId },
    data: {
      status: "sent",
      assignedBrokerId: brokerId,
      assignedAt: new Date(),
    },
  });
}
