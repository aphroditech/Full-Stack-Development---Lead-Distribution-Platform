import { z } from "zod";

export const formCreateSchema = z.object({
  name: z.string().trim().min(1, "Form name is required").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may contain lowercase letters, numbers and single hyphens only",
    )
    .max(120)
    .optional(),
});

export type FormCreateInput = z.infer<typeof formCreateSchema>;
