import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import type { ApiResponse } from "@/types";
import { adminItemsService } from "@/services/admin/items.service";

/**
 * GET handler for admin items with filtering and pagination
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      status: searchParams.get("status"),
      category: searchParams.get("category"),
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      type: searchParams.get("type"),
      query: searchParams.get("query") || "",
    };

    // Call service to handle business logic
    const result = await adminItemsService.getItems(params);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch items",
      },
      { status: 500 }
    );
  }
}
