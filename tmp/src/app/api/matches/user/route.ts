import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import ItemMatch from "@/model/itemMatch.model";
import type { ApiResponse } from "@/types";

/**
 * Endpoint to get matches for a user
 */
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

    // Get all matches related to the user's lost and found items
    const matches = await ItemMatch.find({
      $or: [
        { "lostItem.reportedBy": session.user.id },
        { "foundItem.reportedBy": session.user.id },
      ],
    })
      .populate({
        path: "lostItem",
        populate: { path: "reportedBy", select: "name email" },
      })
      .populate({
        path: "foundItem",
        populate: { path: "reportedBy", select: "name email" },
      })
      .populate("matchedBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error("Error retrieving matches:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
