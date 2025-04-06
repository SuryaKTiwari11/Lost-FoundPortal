import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import { foundItemSchema } from "@/schemas/foundItemSchema";

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
    const body = await request.json();

    // Only log in development environment
    if (process.env.NODE_ENV === "development") {
      console.log("Received report form data:", body);
    }

    try {
      // Validate with Zod schema
      foundItemSchema.parse(body);
    } catch (validationError: any) {
      console.error("Validation error:", validationError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form data",
          details: validationError.errors,
        },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Extract user ID from session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found in session" },
        { status: 400 }
      );
    }

    // Create new found item
    const newFoundItem = new FoundItem({
      itemName: body.itemName,
      description: body.description,
      category: body.category,
      foundLocation: body.foundLocation,
      foundDate: body.foundDate,
      currentHoldingLocation: body.currentHoldingLocation || "",
      imageURL: body.imageURL || "",
      reportedBy: userId,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone || "",
      status: "found",
      isVerified: false,
      claimRequestIds: [],
    });

    // Save to database
    const savedItem = await newFoundItem.save();

    // Only log in development environment
    if (process.env.NODE_ENV === "development") {
      console.log("Saved item to database:", savedItem);
    }

    return NextResponse.json({
      success: true,
      message: "Item reported successfully",
      data: savedItem,
    });
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
