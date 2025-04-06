import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import ClaimRequest from "@/model/claimRequest.model";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get pending claim requests with their associated item and user data
    const claims = await ClaimRequest.find({ status: "pending" })
      .populate("item")
      .populate("user")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        claims,
      },
    });
  } catch (error) {
    console.error("Error fetching claim requests:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
