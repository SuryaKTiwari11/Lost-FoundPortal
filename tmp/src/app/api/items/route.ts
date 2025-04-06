import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";
import FoundItem from "@/model/foundItem.model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const date = searchParams.get("date") || "";
    const location = searchParams.get("location") || "";
    const itemType = searchParams.get("type") || "all"; // 'all', 'lost', or 'found'

    // Build query objects for both lost and found items
    const baseQuery: any = {};

    // Add search filter
    if (query) {
      baseQuery.$or = [
        { itemName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    // Add category filter
    if (category) {
      baseQuery.category = category;
    }

    // Prepare lost items query
    const lostItemsQuery = { ...baseQuery };

    // Add date filter for lost items
    if (date) {
      const searchDate = new Date(date);
      lostItemsQuery.lostDate = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
      };
    }

    // Add location filter for lost items
    if (location) {
      lostItemsQuery.lostLocation = { $regex: location, $options: "i" };
    }

    // Prepare found items query
    const foundItemsQuery = { ...baseQuery };
    foundItemsQuery.isVerified = true; // Only show verified found items

    // Add date filter for found items
    if (date) {
      const searchDate = new Date(date);
      foundItemsQuery.foundDate = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
      };
    }

    // Add location filter for found items
    if (location) {
      foundItemsQuery.foundLocation = { $regex: location, $options: "i" };
    }

    // Get either lost items, found items, or both based on type parameter
    let lostItems: any[] = [];
    let foundItems: any[] = [];

    if (itemType === "all" || itemType === "lost") {
      lostItems = await LostItem.find(lostItemsQuery)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("reportedBy", "name email")
        .lean();
    }

    if (itemType === "all" || itemType === "found") {
      foundItems = await FoundItem.find(foundItemsQuery)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("reportedBy", "name email")
        .lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        lostItems,
        foundItems,
        total: lostItems.length + foundItems.length,
      },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
