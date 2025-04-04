import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "Email or roll number is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
