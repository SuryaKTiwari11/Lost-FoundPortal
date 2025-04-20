import { NextRequest, NextResponse } from "next/server";
import { itemsService } from "@/services/items/items.service";
import { validateItemsSearchQuery } from "@/validators/items/items.validator";

/**
 * GET handler to search for both lost and found items
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = validateItemsSearchQuery(params);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Call the service to search items
    const result = await itemsService.searchItems(validationResult.data);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch items",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
