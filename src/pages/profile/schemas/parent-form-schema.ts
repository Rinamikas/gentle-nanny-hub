import * as z from "zod";
import type { Database } from "@/integrations/supabase/types";

type ParentStatus = Database['public']['Enums']['parent_status'];

export const parentFormSchema = z.object({
  address: z.string().optional(),
  emergency_phone: z.string().optional(),
  special_requirements: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['default', 'star', 'diamond'] as const).default('default'),
});

export type ParentFormValues = z.infer<typeof parentFormSchema>;