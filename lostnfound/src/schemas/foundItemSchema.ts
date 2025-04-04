import { z } from "zod";
import { ITEM_CATEGORIES } from "../model/foundItem.model";

export const foundItemSchema = z.object({
  itemName: z
    .string()
    .min(1, { message: "Item name is required" })
    .max(100, { message: "Item name cannot exceed 100 characters" }),

  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(1000, { message: "Description cannot exceed 1000 characters" }),

  category: z.enum(ITEM_CATEGORIES as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),

  foundLocation: z
    .string()
    .min(1, { message: "Location where item was found is required" })
    .max(200, { message: "Location cannot exceed 200 characters" }),

  foundDate: z.date({
    required_error: "Date when item was found is required",
    invalid_type_error: "Please enter a valid date",
  }),

  currentHoldingLocation: z
    .string()
    .max(200, {
      message: "Current holding location cannot exceed 200 characters",
    })
    .optional(),

  imageURL: z
    .string()
    .url({ message: "Please enter a valid URL for the image" })
    .optional(),

  contactEmail: z
    .string()
    .email({ message: "Please provide a valid email address" }),

  contactPhone: z
    .string()
    .regex(/^[0-9+\-\s()]{10,15}$/, {
      message: "Please provide a valid phone number",
    })
    .optional(),
});

export type FoundItemFormData = z.infer<typeof foundItemSchema>;

// Schema for claiming an item
export const claimItemSchema = z.object({
  itemId: z.string().min(1, { message: "Item ID is required" }),
  userId: z.string().min(1, { message: "User ID is required" }),
  claimReason: z
    .string()
    .min(10, { message: "Please provide a reason for your claim" }),
  proofDescription: z
    .string()
    .min(10, { message: "Please describe proof of ownership" }),
});

export type ClaimItemData = z.infer<typeof claimItemSchema>;
