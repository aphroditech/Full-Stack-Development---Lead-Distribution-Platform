import { z } from "zod";

const brokerSetting = z.object({
  brokerId: z.string().min(1),
  percentage: z.number().min(0).max(100),
  active: z.boolean().optional().default(true),
});

export const distributionCreateSchema = z.object({
  brokers: z
    .array(brokerSetting)
    .min(1, "Select at least one broker for the distribution"),
});

/** Full desired set of broker settings — replaces the current set. */
export const distributionUpdateSchema = z.object({
  brokers: z.array(brokerSetting),
});

export type BrokerSetting = z.infer<typeof brokerSetting>;
