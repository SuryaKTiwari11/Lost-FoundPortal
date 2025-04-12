import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import type { ApiResponse } from "@/types";

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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const type = searchParams.get("type"); // If provided, filter by "found" or "lost"
    const query = searchParams.get("query") || "";

    // Build filter queries
    const foundItemFilter: any = {};
    const lostItemFilter: any = {};

    // Apply common filters to both
    if (status) {
      foundItemFilter.status = status;
      lostItemFilter.status = status;
    }

    if (category) {
      foundItemFilter.category = category;
      lostItemFilter.category = category;
    }

    // Add search query if provided
    if (query) {
      foundItemFilter.$or = [
        { itemName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { foundLocation: { $regex: query, $options: "i" } },
      ];

      lostItemFilter.$or = [
        { itemName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { lastLocation: { $regex: query, $options: "i" } },
      ];
    }

    // Build sort options
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    let items = [];
    let totalItems = 0;

    // Fetch items based on type parameter
    if (type === "lost") {
      // Only lost items
      items = await LostItem.find(lostItemFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("reportedBy", "name email");

      totalItems = await LostItem.countDocuments(lostItemFilter);
    } else if (type === "found") {
      // Only found items
      items = await FoundItem.find(foundItemFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("reportedBy", "name email");

      totalItems = await FoundItem.countDocuments(foundItemFilter);
    } else {
      // Fetch both types and merge them
      const lostItems = await LostItem.find(lostItemFilter)
        .sort(sort)
        .populate("reportedBy", "name email")
        .lean(); // Convert to plain JS object

      const foundItems = await FoundItem.find(foundItemFilter)
        .sort(sort)
        .populate("reportedBy", "name email")
        .lean(); // Convert to plain JS object

      // Add type field to distinguish lost from found
      const processedLostItems = lostItems.map((item) => ({
        ...item,
        itemType: "lost",
        locationFound: item.lastLocation, // Normalize field names for UI
        dateFound: item.dateLost, // Normalize field names for UI
      }));

      const processedFoundItems = foundItems.map((item) => ({
        ...item,
        itemType: "found",
      }));

      // Combine and sort manually
      const allItems = [...processedLostItems, ...processedFoundItems];
      allItems.sort((a, b) => {
        if (sortOrder === "asc") {
          return new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
        } else {
          return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
        }
      });

      // Apply pagination manually
      totalItems = allItems.length;
      items = allItems.slice(skip, skip + limit);
    }

    // Get counts for dashboard stats
    const stats = {
      pending:
        (await FoundItem.countDocuments({ status: "pending" })) +
        (await LostItem.countDocuments({ status: "pending" })),
      verified:
        (await FoundItem.countDocuments({ status: "verified" })) +
        (await LostItem.countDocuments({ status: "verified" })),
      rejected:
        (await FoundItem.countDocuments({ status: "rejected" })) +
        (await LostItem.countDocuments({ status: "rejected" })),
      claimed:
        (await FoundItem.countDocuments({ status: "claimed" })) +
        (await LostItem.countDocuments({ status: "claimed" })),
      total:
        (await FoundItem.countDocuments({})) +
        (await LostItem.countDocuments({})),
    };

    return NextResponse.json({
      success: true,
      items,
      stats,
      pagination: {
        total: totalItems,
        page,
        limit,
        pages: Math.ceil(totalItems / limit),
      },
    });
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
