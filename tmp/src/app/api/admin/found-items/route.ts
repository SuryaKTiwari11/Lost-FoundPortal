import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import type { ApiResponse } from "@/types";

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

    await dbConnect();

    // Get all found items that haven't been claimed or matched yet
    const items = await FoundItem.find({
      status: { $in: ["pending", "verified"] },
    })
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email");

    // Count total items
    const totalCount = await FoundItem.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching found items:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
