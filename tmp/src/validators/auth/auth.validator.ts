import { z } from "zod";

/**
 * Validator for user signup
 */
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

/**
 * Validator for email verification
 */
export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email format"),
  code: z
    .string()
    .min(6, "Verification code must be at least 6 characters long"),
});

/**
 * Validator for password reset
 */
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().min(6, "Reset code must be at least 6 characters long"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

/**
 * Validate signup data
 */
export function validateSignUp(data: unknown) {
  return signUpSchema.safeParse(data);
}

/**
 * Validate email verification data
 */
export function validateVerifyEmail(data: unknown) {
  return verifyEmailSchema.safeParse(data);
}

/**
 * Validate password reset data
 */
export function validateResetPassword(data: unknown) {
  return resetPasswordSchema.safeParse(data);
}
