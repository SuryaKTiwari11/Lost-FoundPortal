import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { foundItemsService } from "@/services/items/foundItems.service";
import { validateClaimFoundItem } from "@/validators/items/foundItems.validator";

/**
 * POST handler to claim a found item
 */
export async function POST(request: NextRequest) {
  try {
    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const data = await request.json();

    const validationResult = validateClaimFoundItem(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Call the service to claim the found item
    const result = await foundItemsService.claimFoundItem(
      validationResult.data,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error claiming found item:", error);

    if (error.message === "Found item not found") {
      return NextResponse.json(
        { success: false, error: "Found item not found" },
        { status: 404 }
      );
    }

    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (error.message === "You have already claimed this item") {
      return NextResponse.json(
        { success: false, error: "You have already claimed this item" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to claim found item",
      },
      { status: 500 }
    );
  }
}
