import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { adminService } from "@/services/admin/admin.service";

/**
 * GET handler to fetch admin dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Call the service to get dashboard stats
    const stats = await adminService.getDashboardStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch admin dashboard stats",
      },
      { status: 500 }
    );
  }
}
