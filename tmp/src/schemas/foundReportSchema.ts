import { z } from "zod";

export const foundReportSchema = z.object({
  lostItemId: z.string(),
  foundLocation: z.string().min(3, "Please provide where you found the item"),
  foundDate: z.string().min(1, "Please select the date you found the item"),
  currentHoldingLocation: z
    .string()
    .min(3, "Please provide where the item is currently held"),
  additionalNotes: z.string().optional(),
  contactPhone: z.string().optional(),
});

export type FoundReportData = z.infer<typeof foundReportSchema>;
