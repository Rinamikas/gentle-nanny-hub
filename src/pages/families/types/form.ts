import { z } from "zod";
import { familyFormSchema } from "../schemas/family-form-schema";

export type FormValues = z.infer<typeof familyFormSchema>;