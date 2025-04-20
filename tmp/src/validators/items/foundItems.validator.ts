import { z } from "zod";

// Schema for creating a found item
export const createFoundItemSchema = z.object({
  itemName: z
    .string()
    .min(2, "Item name is required and must be at least 2 characters"),
  description: z
    .string()
    .min(10, "Description is required and must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  foundLocation: z
    .string()
    .min(2, "Found location is required and must be at least 2 characters"),
  foundDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
  currentHoldingLocation: z.string().optional(),
  imageURL: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  additionalDetails: z.string().optional(),
});

// Schema for updating a found item
export const updateFoundItemSchema = createFoundItemSchema.partial();

// Schema for querying found items
export const foundItemsQuerySchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
  isVerified: z.boolean().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

// Validation functions
export function validateCreateFoundItem(data: any) {
  return createFoundItemSchema.safeParse(data);
}

export function validateUpdateFoundItem(data: any) {
  return updateFoundItemSchema.safeParse(data);
}

export function validateFoundItemsQuery(data: any) {
  return foundItemsQuerySchema.safeParse(data);
}
