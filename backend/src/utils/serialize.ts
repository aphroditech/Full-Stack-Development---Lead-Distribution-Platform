import type { Broker, Lead } from "@prisma/client";
import { parseWorkingDays } from "../services/time.service";

export function serializeBroker(b: Broker) {
  return {
    id: b.id,
    name: b.name,
    active: b.active,
    dailyCap: b.dailyCap,
    timezone: b.timezone,
    openingTime: b.openingTime,
    closingTime: b.closingTime,
    workingDays: parseWorkingDays(b.workingDays),
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

type LeadWithBroker = Lead & { broker?: { id: string; name: string } | null };

export function serializeLead(l: LeadWithBroker) {
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    ipAddress: l.ipAddress,
    formName: l.formName,
    status: l.status,
    assignedBrokerId: l.assignedBrokerId,
    broker: l.broker ? { id: l.broker.id, name: l.broker.name } : null,
    assignedAt: l.assignedAt,
    createdAt: l.createdAt,
  };
}
