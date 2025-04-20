import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import ClaimRequest from "@/model/claimRequest.model";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import { z } from "zod";
import type { ApiResponse } from "@/types";

// Validation schema for claim requests
const claimSchema = z.object({
  foundItemId: z.string().min(1, "Found item ID is required"),
  lostItemId: z.string().optional(),
  ownershipProof: z
    .string()
    .min(10, "Please provide more details to prove ownership"),
  contactDetails: z.string().min(10, "Contact details are required"),
});

// GET handler to list a user's claim requests
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get all claims submitted by the user
    const claims = await ClaimRequest.find({ claimant: session.user.id })
      .populate("foundItem")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: claims,
    });
  } catch (error) {
    console.error("Error retrieving claim requests:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler to submit a new claim request
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = claimSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data provided",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if the found item exists
    const foundItem = await FoundItem.findById(validation.data.foundItemId);
    if (!foundItem) {
      return NextResponse.json(
        { success: false, error: "Found item does not exist" },
        { status: 404 }
      );
    }

    // Check if the item is available to be claimed
    if (foundItem.status !== "verified" && foundItem.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: `This item cannot be claimed as it is currently ${foundItem.status}`,
        },
        { status: 400 }
      );
    }

    // Check if the user has already submitted a claim for this item
    const existingClaim = await ClaimRequest.findOne({
      foundItem: validation.data.foundItemId,
      claimant: session.user.id,
      status: { $in: ["pending", "approved"] },
    });

    if (existingClaim) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already submitted a claim for this item",
          claimId: existingClaim._id,
        },
        { status: 409 }
      );
    }

    // Create the claim request
    const newClaim = new ClaimRequest({
      foundItem: validation.data.foundItemId,
      lostItem: validation.data.lostItemId || null,
      claimant: session.user.id,
      ownershipProof: validation.data.ownershipProof,
      contactDetails: validation.data.contactDetails,
      status: "pending",
      claimDate: new Date(),
    });

    await newClaim.save();

    // Update the found item status
    foundItem.status = "pending_claim";
    await foundItem.save();

    return NextResponse.json({
      success: true,
      message: "Claim request submitted successfully",
      data: {
        claimId: newClaim._id,
      },
    });
  } catch (error) {
    console.error("Error creating claim request:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
