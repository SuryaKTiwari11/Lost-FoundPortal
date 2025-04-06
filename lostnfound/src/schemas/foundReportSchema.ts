import { z } from "zod";

export const foundReportSchema = z.object({
  lostItemId: z.string().min(1, { message: "Lost item ID is required" }),

  foundLocation: z
    .string()
    .min(1, { message: "Location where item was found is required" })
    .max(200, { message: "Location cannot exceed 200 characters" }),

  foundDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date",
  }),

  currentHoldingLocation: z
    .string()
    .min(1, { message: "Current holding location is required" })
    .max(200, { message: "Location cannot exceed 200 characters" }),

  additionalNotes: z
    .string()
    .max(1000, { message: "Notes cannot exceed 1000 characters" })
    .optional(),

  contactPhone: z
    .string()
    .regex(/^[0-9+\-\s()]{10,15}$/, {
      message: "Please provide a valid phone number",
    })
    .optional(),
});

export type FoundReportData = z.infer<typeof foundReportSchema>;
