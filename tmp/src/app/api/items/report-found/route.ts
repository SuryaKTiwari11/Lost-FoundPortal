import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { foundItemsService } from "@/services/items/foundItems.service";
import { validateCreateFoundItem } from "@/validators/items/foundItems.validator";


/**
 * POST handler to report a found item
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const data = await request.json();

    // Only log in development environment
    if (process.env.NODE_ENV === "development") {
      console.log("Received report form data:", data);
    }

    // Validate with our validator
    const validationResult = validateCreateFoundItem(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form data",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Extract user ID from session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found in session" },
        { status: 400 }
      );
    }

    // Call service to create found item
    const result = await foundItemsService.createFoundItem(
      validationResult.data,
      userId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error reporting found item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to report found item",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
