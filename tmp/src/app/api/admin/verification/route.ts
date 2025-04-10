import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import type { ApiResponse } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId, stepType, verified, notes } = body;

    if (!itemId || !stepType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const item = await FoundItem.findById(itemId);

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Initialize verification steps object if it doesn't exist
    if (!item.verificationSteps) {
      item.verificationSteps = {};
    }

    // Initialize verification history array if it doesn't exist
    if (!item.verificationHistory) {
      item.verificationHistory = [];
    }

    const now = new Date();
    const adminId = session.user.id;

    // Update the specific verification step
    switch (stepType) {
      case "photo":
        item.verificationSteps.photoVerified = verified;
        item.verificationSteps.photoVerifiedAt = now;
        item.verificationSteps.photoVerifiedBy = adminId;
        item.verificationSteps.photoVerificationNotes = notes || "";
        break;
      case "description":
        item.verificationSteps.descriptionVerified = verified;
        item.verificationSteps.descriptionVerifiedAt = now;
        item.verificationSteps.descriptionVerifiedBy = adminId;
        item.verificationSteps.descriptionVerificationNotes = notes || "";
        break;
      case "ownershipProof":
        item.verificationSteps.ownershipProofVerified = verified;
        item.verificationSteps.ownershipProofVerifiedAt = now;
        item.verificationSteps.ownershipProofVerifiedBy = adminId;
        item.verificationSteps.ownershipProofVerificationNotes = notes || "";
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid verification step type" },
          { status: 400 }
        );
    }

    // Add to verification history
    item.verificationHistory.push({
      timestamp: now,
      action: `${stepType}Verification-${verified ? "approved" : "rejected"}`,
      performedBy: adminId,
      notes: notes || "",
    });

    // If all verification steps are completed and approved, mark the item as verified
    const allVerified =
      item.verificationSteps.photoVerified !== false &&
      item.verificationSteps.descriptionVerified !== false &&
      item.verificationSteps.ownershipProofVerified !== false;

    // Check if at least one step has been explicitly verified
    const hasVerifiedSteps =
      item.verificationSteps.photoVerified === true ||
      item.verificationSteps.descriptionVerified === true ||
      item.verificationSteps.ownershipProofVerified === true;

    // Update the overall verification status only if we have verified steps
    if (hasVerifiedSteps) {
      if (allVerified) {
        item.isVerified = true;
        item.status = "verified";
      } else {
        item.isVerified = false;
      }
    }

    await item.save();

    return NextResponse.json({
      success: true,
      message: `Verification step '${stepType}' ${
        verified ? "approved" : "rejected"
      }`,
      data: {
        verificationSteps: item.verificationSteps,
        isVerified: item.isVerified,
      },
    });
  } catch (error) {
    console.error("Error in verification API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const itemId = request.nextUrl.searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const item = await FoundItem.findById(itemId)
      .populate("verificationSteps.photoVerifiedBy", "name email")
      .populate("verificationSteps.descriptionVerifiedBy", "name email")
      .populate("verificationSteps.ownershipProofVerifiedBy", "name email")
      .populate("verificationHistory.performedBy", "name email");

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        verificationSteps: item.verificationSteps || {},
        verificationHistory: item.verificationHistory || [],
        isVerified: item.isVerified,
      },
    });
  } catch (error) {
    console.error("Error retrieving verification data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
