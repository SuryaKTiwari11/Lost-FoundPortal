import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import LostItem from "@/models/LostItem";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query object
    const searchQuery: any = {};

    if (query && query.trim() !== "") {
      searchQuery["$or"] = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ];
    }

    // Add category filter
    if (category && category !== "all") {
      searchQuery.category = category;
    }

    // Add date range filter
    if (startDate || endDate) {
      searchQuery.date = {};
      if (startDate) {
        searchQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        searchQuery.date.$lte = new Date(endDate);
      }
    }

    const items = await LostItem.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search items" },
      { status: 500 }
    );
  }
}
