import { z } from "zod";

/**
 * Validator for updating a user profile
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().url("Invalid URL format").optional(),
});

/**
 * Validate the input data for updating a user profile
 */
export function validateUpdateProfile(data: unknown) {
  return updateProfileSchema.safeParse(data);
}
