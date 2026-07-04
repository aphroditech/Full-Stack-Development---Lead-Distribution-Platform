import { z } from "zod";

export const publicLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  email: z.string().trim().email("A valid email is required"),
  phone: z.string().trim().min(1, "Phone is required").max(40),
});
