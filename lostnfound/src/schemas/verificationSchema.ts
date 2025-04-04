import { z } from "zod";

export const verifyEmailSchema = z.object({
  verifyCode: z.string().min(1, { message: "Verification code is required" }),
  universityEmail: z.string().email({ message: "Invalid email address" }),
});

export const resendVerificationSchema = z.object({
  universityEmail: z
    .string()
    .email({ message: "Invalid email address" })
    .regex(/@thapar\.edu$/, {
      message: "Email must be a valid @thapar.edu address",
    }),
});

export const verifyItemSchema = z.object({
  itemId: z.string().min(1, { message: "Item ID is required" }),
  adminId: z.string().min(1, { message: "Admin ID is required" }),
  verificationNotes: z.string().optional(),
});

export type VerifyEmailData = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationData = z.infer<typeof resendVerificationSchema>;
export type VerifyItemData = z.infer<typeof verifyItemSchema>;
