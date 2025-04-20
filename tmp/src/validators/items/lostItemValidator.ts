import z from "zod";
import { categories } from "@/constants/categories";

/**
 * Validation schema for lost item data
 */
export const lostItemSchema = z.object({
  itemName: z
    .string()
    .min(3, "Item name must be at least 3 characters")
    .max(100),
  category: z.enum(categories, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  location: z
    .string()
    .min(3, "Last seen location must be at least 3 characters")
    .max(100),
  lostDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please provide a valid date",
  }),
  reward: z.number().optional(),
  images: z.array(z.string()).optional(),
  additionalDetails: z.string().max(500).optional(),
  contactPreference: z.enum(["email", "phone", "any"]).optional(),
});

/**
 * Helper function to validate lost item data
 */
export function validateLostItemData(data: unknown) {
  try {
    const validData = lostItemSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return { success: false, errors };
    }
    return {
      success: false,
      errors: [{ path: "", message: "Invalid data format" }],
    };
  }
}
