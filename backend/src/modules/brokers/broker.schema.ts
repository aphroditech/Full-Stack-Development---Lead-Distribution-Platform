import { z } from "zod";
import { DateTime } from "luxon";

const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected time in HH:mm format (00:00–23:59)");

const timezone = z
  .string()
  .refine((tz) => DateTime.local().setZone(tz).isValid, "Invalid IANA timezone");

const workingDays = z
  .array(z.number().int().min(1).max(7))
  .min(1, "Select at least one working day")
  .max(7);

export const brokerCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  active: z.boolean().optional().default(true),
  dailyCap: z.number().int().min(1, "Daily cap must be at least 1").max(100000),
  timezone,
  openingTime: hhmm,
  closingTime: hhmm,
  workingDays,
});

export const brokerUpdateSchema = brokerCreateSchema.partial();

export type BrokerCreateInput = z.infer<typeof brokerCreateSchema>;
