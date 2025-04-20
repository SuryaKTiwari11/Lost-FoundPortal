import { z } from "zod";

/**
 * Schema for validating batch verification operations
 */
export const batchVerifySchema = z.object({
  ids: z.array(z.string()).min(1, "At least one item ID must be provided"),
  itemType: z.enum(["lost", "found"]),
  isVerified: z.boolean(),
});

/**
 * Validate batch verification data
 */
export function validateBatchVerify(data: any) {
  return batchVerifySchema.safeParse(data);
}
