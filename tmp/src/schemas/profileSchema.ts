import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name cannot exceed 100 characters" }),

  rollNumber: z
    .string()
    .regex(/^[0-9A-Z]+$/, {
      message: "Roll number should only contain alphanumeric characters",
    })
    .optional(),

  contactPhone: z
    .string()
    .regex(/^[0-9+\-\s()]{10,15}$/, {
      message: "Please provide a valid phone number",
    })
    .optional(),

  alternateEmail: z
    .string()
    .email({ message: "Please provide a valid email address" })
    .optional(),

  department: z
    .string()
    .max(100, { message: "Department name cannot exceed 100 characters" })
    .optional(),

  yearOfStudy: z
    .enum(
      [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year",
        "Faculty",
        "Staff",
        "Other",
      ],
      {
        errorMap: () => ({ message: "Please select a valid option" }),
      }
    )
    .optional(),

  hostelDetails: z
    .string()
    .max(200, { message: "Hostel details cannot exceed 200 characters" })
    .optional(),

  bio: z
    .string()
    .max(500, { message: "Bio cannot exceed 500 characters" })
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
