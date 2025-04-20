import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import { CommunicationHistory } from "@/model/communicationHistory.model";
import type { ApiResponse } from "@/types";

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

    // Get notifications where the user is the recipient
    const notifications = await CommunicationHistory.find({
      recipient: session.user.id,
    })
      .sort({ sentAt: -1 })
      .populate("sender", "name email")
      .limit(50);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve notifications" },
      { status: 500 }
    );
  }
}
