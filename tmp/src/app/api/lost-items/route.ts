import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse request URL to get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 20;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!)
      : 1;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "recent";

    // Build query
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { lostLocation: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "alphabetical":
        sortOptions = { itemName: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Execute query with pagination
    const items = await LostItem.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalItems = await LostItem.countDocuments(query);

    // Return success response with items and pagination info
    return NextResponse.json({
      success: true,
      items,
      pagination: {
        total: totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        hasMore: skip + items.length < totalItems,
      },
    });
  } catch (error) {
    console.error("Error fetching lost items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lost items" },
      { status: 500 }
    );
  }
}

// POST request handler to create a new lost item
export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse request body
    const data = await request.json();

    // Extract user information from request auth token
    // (This assumes you're using some auth middleware that adds user details)
    // If not available, you would need to extract from the request

    // Create a new lost item document
    const newLostItem = new LostItem({
      ...data,
      status: "lost",
      // Add reportedBy fields here when auth is implemented
    });

    // Save to database
    await newLostItem.save();

    return NextResponse.json(
      {
        success: true,
        message: "Lost item reported successfully",
        item: newLostItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lost item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lost item" },
      { status: 500 }
    );
  }
}
