import { z } from "zod";

/**
 * Schema for validating item search queries
 */
export const itemsSearchQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["all", "lost", "found"]).optional().default("all"),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(50),
});

/**
 * Validate a search query for items
 */
export function validateItemsSearchQuery(data: any) {
  return itemsSearchQuerySchema.safeParse(data);
}
