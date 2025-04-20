import { z } from "zod";

/**
 * Validator for updating an item as admin
 */
export const updateItemSchema = z.object({
  status: z
    .enum([
      "pending",
      "verified",
      "rejected",
      "claimed",
      "resolved",
      "archived",
    ])
    .optional(),
  adminNotes: z.string().optional(),
});

/**
 * Validator for updating a claim request
 */
export const updateClaimRequestSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  adminNotes: z.string().optional(),
});

/**
 * Validator for getting claim requests
 */
export const getClaimRequestsSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

/**
 * Schema for validating claim request parameters
 */
export const claimRequestsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

/**
 * Schema for validating claim processing
 */
export const processClaimSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required"),
  approved: z.boolean(),
  notes: z.string().optional(),
});

/**
 * Schema for validating item matching
 */
export const createMatchSchema = z.object({
  lostItemId: z.string().min(1, "Lost item ID is required"),
  foundItemId: z.string().min(1, "Found item ID is required"),
});

/**
 * Schema for validating verification
 */
export const verificationSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  stepType: z.enum(["photo", "description", "ownershipProof"]),
  verified: z.boolean(),
  notes: z.string().optional(),
});

/**
 * Schema for batch verification
 */
export const batchVerificationSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one item ID is required"),
  isVerified: z.boolean(),
});

/**
 * Schema for sending notifications
 */
export const sendNotificationSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Email body is required"),
  itemIds: z.array(z.string()).optional(),
});

/**
 * Validate admin item update data
 */
export function validateUpdateItem(data: unknown) {
  return updateItemSchema.safeParse(data);
}

/**
 * Validate admin claim request update data
 */
export function validateUpdateClaimRequest(data: unknown) {
  return updateClaimRequestSchema.safeParse(data);
}

/**
 * Validate get claim requests query
 */
export function validateGetClaimRequests(data: unknown) {
  return getClaimRequestsSchema.safeParse(data);
}

/**
 * Validate claim request parameters
 */
export function validateClaimRequestsQuery(data: unknown) {
  return claimRequestsQuerySchema.safeParse(data);
}

/**
 * Validate claim processing data
 */
export function validateProcessClaim(data: unknown) {
  return processClaimSchema.safeParse(data);
}

/**
 * Validate item matching data
 */
export function validateCreateMatch(data: unknown) {
  return createMatchSchema.safeParse(data);
}

/**
 * Validate verification data
 */
export function validateVerification(data: unknown) {
  return verificationSchema.safeParse(data);
}

/**
 * Validate batch verification data
 */
export function validateBatchVerification(data: unknown) {
  return batchVerificationSchema.safeParse(data);
}

/**
 * Validate notification data
 */
export function validateSendNotification(data: unknown) {
  return sendNotificationSchema.safeParse(data);
}
