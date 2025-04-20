import { z } from "zod";

/**
 * Schema for validating notification requests
 */
export const notificationSchema = z.object({
  subject: z.string().min(2, "Subject must be at least 2 characters long"),
  body: z.string().min(10, "Body must be at least 10 characters long"),
  itemIds: z.array(z.string()).optional(),
});

/**
 * Validate notification data
 */
export function validateNotification(data: any) {
  return notificationSchema.safeParse(data);
}
