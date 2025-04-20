import { z } from "zod";

// Schema for creating a lost item
export const createLostItemSchema = z.object({
  itemName: z
    .string()
    .min(2, "Item name is required and must be at least 2 characters"),
  description: z
    .string()
    .min(10, "Description is required and must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  lostLocation: z
    .string()
    .min(2, "Lost location is required and must be at least 2 characters"),
  lostDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
  imageURL: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  reward: z.string().optional(),
  additionalDetails: z.string().optional(),
});

// Schema for updating a lost item
export const updateLostItemSchema = createLostItemSchema.partial();

// Schema for querying lost items
export const lostItemsQuerySchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

// Validation functions
export function validateCreateLostItem(data: any) {
  return createLostItemSchema.safeParse(data);
}

export function validateUpdateLostItem(data: any) {
  return updateLostItemSchema.safeParse(data);
}

export function validateLostItemsQuery(data: any) {
  return lostItemsQuerySchema.safeParse(data);
}
