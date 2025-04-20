import { NextRequest, NextResponse } from "next/server";
import { lostItemsService } from "@/services/items/lostItems.service";
import { z } from "zod";

// Search query validator schema
const searchQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().optional().default(20),
});

export async function GET(request: NextRequest) {
  try {
    // Extract search parameters
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    // Validate search parameters
    const validationResult = searchQuerySchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid search parameters",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Call service to search lost items
    const result = await lostItemsService.searchLostItems(
      validationResult.data.query || "",
      {
        category: validationResult.data.category,
        startDate: validationResult.data.startDate,
        endDate: validationResult.data.endDate,
        limit: validationResult.data.limit,
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search items",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
