import { z } from "zod";

export const assignLeadSchema = z.object({
  brokerId: z.string().min(1, "brokerId is required"),
});

export const leadStatusValues = ["sent", "unsent", "duplicate", "failed"] as const;
