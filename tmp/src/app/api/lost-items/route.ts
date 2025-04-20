import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { lostItemsService } from "@/services/items/lostItems.service";
import { validateLostItemData } from "@/validators/items/lostItemValidator";
import type { ApiResponse } from "@/types";

/**
 * GET handler for lost items
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    // Call the service to handle fetching lost items
    const result = await lostItemsService.getLostItems(params);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching lost items:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch lost items",
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for reporting a lost item
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
    const validationResult = validateLostItemData(requestData);

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

    // Call the service to handle reporting the lost item
    const result = await lostItemsService.reportLostItem(itemData);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error reporting lost item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to report lost item",
      },
      { status: 500 }
    );
  }
}
