import z from "zod";
import { categories } from "@/constants/categories";

/**
 * Validation schema for found item data
 */
export const foundItemSchema = z.object({
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
    .min(3, "Location must be at least 3 characters")
    .max(100),
  foundDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please provide a valid date",
  }),
  contactInfo: z.string().optional(),
  images: z.array(z.string()).optional(),
  additionalDetails: z.string().max(500).optional(),
});

/**
 * Helper function to validate found item data
 */
export function validateFoundItemData(data: unknown) {
  try {
    const validData = foundItemSchema.parse(data);
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
