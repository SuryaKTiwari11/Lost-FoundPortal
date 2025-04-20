import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { adminService } from "@/services/admin/admin.service";
import { validateBatchVerify } from "@/validators/admin/batch-verify.validator";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";

/**
 * POST handler for batch verifying items
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify admin access
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin privileges required" },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const data = await request.json();

    const validationResult = validateBatchVerify(data);
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

    // Process the batch verification based on item type
    let result;
    if (validationResult.data.itemType === "found") {
      result = await adminService.batchVerifyItems(
        validationResult.data.ids,
        validationResult.data.isVerified
      );
    } else {
      // For lost items, implement specific handling if needed
      // For now, return an error as it's not implemented yet
      return NextResponse.json(
        {
          success: false,
          error: "Batch verification for lost items is not implemented yet",
        },
        { status: 501 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in batch verification:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process batch verification",
      },
      { status: 500 }
    );
  }
}
