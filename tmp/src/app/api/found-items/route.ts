import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import User from "@/model/user.model";

// GET handler to retrieve all found items or filter by status
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const reporter = searchParams.get("reporter"); // Get reporter email parameter
    const page = parseInt(searchParams.get("page") || "1");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 50;
    const skip = (page - 1) * limit;

    // Build query based on filters
    let query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;

    // If reporter email is provided, filter by the reporter
    if (reporter) {
      // First need to find the user with this email
      const reporterUser = await User.findOne({ email: reporter });
      if (reporterUser) {
        // Filter items by reportedBy field (user ID)
        query.reportedBy = reporterUser._id;
      } else {
        // If no user found with this email, return empty array
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page,
            pages: 0,
          },
        });
      }
    }

    // Count total items for pagination
    const total = await FoundItem.countDocuments(query);

    // Execute query with pagination
    const foundItems = await FoundItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reportedBy", "name email username")
      .lean();

    return NextResponse.json({
      success: true,
      data: foundItems,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching found items:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch found items",
      },
      { status: 500 }
    );
  }
}

// POST handler to create a new found item
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse request body
    const data = await request.json();

    // Create new found item
    const foundItem = new FoundItem(data);
    const savedItem = await foundItem.save();

    return NextResponse.json(
      {
        success: true,
        data: savedItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating found item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create found item",
      },
      { status: 500 }
    );
  }
}
