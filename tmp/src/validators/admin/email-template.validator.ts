import { z } from "zod";

/**
 * Schema for validating email template creation
 */
export const createEmailTemplateSchema = z.object({
  name: z.string().min(2, "Template name must be at least 2 characters long"),
  subject: z.string().min(2, "Subject must be at least 2 characters long"),
  body: z.string().min(10, "Body must be at least 10 characters long"),
  type: z.string().optional().default("general"),
});

/**
 * Schema for validating email template updates
 */
export const updateEmailTemplateSchema = z.object({
  name: z
    .string()
    .min(2, "Template name must be at least 2 characters long")
    .optional(),
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters long")
    .optional(),
  body: z
    .string()
    .min(10, "Body must be at least 10 characters long")
    .optional(),
  type: z.string().optional(),
});

/**
 * Validate email template creation data
 */
export function validateCreateEmailTemplate(data: any) {
  return createEmailTemplateSchema.safeParse(data);
}

/**
 * Validate email template update data
 */
export function validateUpdateEmailTemplate(data: any) {
  return updateEmailTemplateSchema.safeParse(data);
}
