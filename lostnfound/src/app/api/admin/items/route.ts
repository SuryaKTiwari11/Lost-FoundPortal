import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending";

    await dbConnect();

    // Get items based on status
    let query = {};
    if (status === "pending") {
      query = { status: "found", isVerified: false };
    } else if (status === "verified") {
      query = { status: "found", isVerified: true };
    } else if (status === "claimed") {
      query = { status: "claimed" };
    } else if (status === "rejected") {
      query = { status: "rejected" };
    }

    const items = await FoundItem.find(query)
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email")
      .populate("claimedBy", "name email");

    // Get statistics for all statuses
    const pendingCount = await FoundItem.countDocuments({
      status: "found",
      isVerified: false,
    });
    const verifiedCount = await FoundItem.countDocuments({
      status: "found",
      isVerified: true,
    });
    const claimedCount = await FoundItem.countDocuments({ status: "claimed" });
    const rejectedCount = await FoundItem.countDocuments({
      status: "rejected",
    });
    const totalCount = await FoundItem.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        items,
        stats: {
          pending: pendingCount,
          verified: verifiedCount,
          claimed: claimedCount,
          rejected: rejectedCount,
          total: totalCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin items:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
