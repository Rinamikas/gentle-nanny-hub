import * as z from "zod";

export const parentFormSchema = z.object({
  address: z.string().optional(),
  additional_phone: z.string().optional(),
  special_requirements: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["default", "star", "diamond"]).default("default"),
});

export type ParentFormValues = z.infer<typeof parentFormSchema>;