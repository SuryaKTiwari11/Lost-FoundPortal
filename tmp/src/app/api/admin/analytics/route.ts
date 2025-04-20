import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { analyticsService } from "@/services/admin/analytics.service";
import User from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";
import type { ApiResponse } from "@/types";

/**
 * GET handler for admin dashboard analytics
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);

    // Check for authenticated session
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Verify admin access
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      console.log("Non-admin access attempt:", session.user.email);
      return NextResponse.json(
        { success: false, error: "Admin privileges required" },
        { status: 403 }
      );
    }

    // Get timeframe from query params (default to 'month')
    const timeframe = request.nextUrl.searchParams.get("timeframe") || "month";

    // Call the analytics service to get dashboard data
    const result = await analyticsService.getDashboardAnalytics(
      timeframe as "week" | "month" | "year" | "all"
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error retrieving analytics data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
