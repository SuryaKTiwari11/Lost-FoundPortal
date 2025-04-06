import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";
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

    // Get all lost items that haven't been matched yet
    const items = await LostItem.find({ status: "lost" })
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email");

    // Count total items
    const totalCount = await LostItem.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching lost items:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
