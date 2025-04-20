import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { foundItemsService } from "@/services/items/foundItems.service";
import { validateFoundItemData } from "@/validators/items/foundItemValidator";
import type { ApiResponse } from "@/types";

/**
 * GET handler for found items
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    // Call the service to handle fetching found items
    const result = await foundItemsService.getFoundItems(params);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching found items:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch found items",
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for reporting a found item
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const requestData = await request.json();

    // Validate the item data
    const validationResult = validateFoundItemData(requestData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          validationErrors: validationResult.errors,
        },
        { status: 400 }
      );
    }

    // Add user ID to the item data
    const itemData = {
      ...requestData,
      reportedBy: session.user.id,
    };

    // Call the service to handle reporting the found item
    const result = await foundItemsService.reportFoundItem(itemData);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error reporting found item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to report found item",
      },
      { status: 500 }
    );
  }
}
