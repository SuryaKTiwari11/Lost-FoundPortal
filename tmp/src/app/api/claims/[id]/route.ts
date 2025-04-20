import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import ClaimRequest from "@/model/claimRequest.model";
import FoundItem from "@/model/foundItem.model";
import type { ApiResponse } from "@/types";

// GET handler to retrieve details of a specific claim request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Claim ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const claim = await ClaimRequest.findById(id)
      .populate("foundItem")
      .populate("lostItem")
      .populate("claimant", "name email phone");

    if (!claim) {
      return NextResponse.json(
        { success: false, error: "Claim request not found" },
        { status: 404 }
      );
    }

    // Check authorization - only the claimant or admins can view
    const isAdmin = session.user.role === "admin";
    const isClaimant = claim.claimant._id.toString() === session.user.id;

    if (!isAdmin && !isClaimant) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: claim,
    });
  } catch (error) {
    console.error("Error retrieving claim request:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT handler to allow users to cancel their claim requests
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Claim ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the claim
    const claim = await ClaimRequest.findById(id);
    if (!claim) {
      return NextResponse.json(
        { success: false, error: "Claim request not found" },
        { status: 404 }
      );
    }

    // User can only cancel their own claims
    if (
      claim.claimant.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if the claim can be canceled
    if (claim.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: `Claim with status '${claim.status}' cannot be canceled`,
        },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { action, reason } = body;

    if (action !== "cancel") {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    // Update the claim
    claim.status = "canceled";
    claim.cancellationReason = reason || "Canceled by user";
    claim.updatedAt = new Date();
    await claim.save();

    // Reset the found item status if this was the only pending claim
    const foundItem = await FoundItem.findById(claim.foundItem);
    if (foundItem) {
      const otherPendingClaims = await ClaimRequest.findOne({
        foundItem: claim.foundItem,
        status: "pending",
        _id: { $ne: id },
      });

      if (!otherPendingClaims) {
        foundItem.status = "verified";
        await foundItem.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Claim request canceled successfully",
    });
  } catch (error) {
    console.error("Error canceling claim request:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
