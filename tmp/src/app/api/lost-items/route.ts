import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect, { connectToDatabase } from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";
import User from "@/model/user.model";
// Import the environment loader to ensure proper configuration
import "@/lib/load-env";

// POST handler to create a new lost item
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse the request body
    const data = await request.json();
    console.log("Received lost item data:", data);

    // Get the user from the database to ensure proper relation
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Prepare the image data
    let imageURL = null;
    if (data.imageURL) {
      imageURL = data.imageURL;
    } else if (data.images && data.images.length > 0) {
      imageURL = data.images[0]; // Use the first image if available
    }

    // Create a new lost item
    const lostItem = new LostItem({
      itemName: data.itemName,
      description: data.description,
      category: data.category,
      lostLocation: data.lastSeenLocation || data.lostLocation,
      lostDate: new Date(data.lastSeenDate || data.lostDate),
      ownerName: data.ownerName,
      reportedBy: session.user.id,
      imageURL: imageURL,
      images: data.images || [],
      status: "pending", // All new items start as pending
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      reward: data.reward || "",
    });

    // Save the lost item to the database
    const savedItem = await lostItem.save();
    console.log("Lost item saved to database with ID:", savedItem._id);

    return NextResponse.json({
      success: true,
      message: "Lost item reported successfully",
      itemId: savedItem._id,
    });
  } catch (error: any) {
    console.error("Error reporting lost item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to report lost item",
      },
      { status: 500 }
    );
  }
}

// GET method to fetch all lost items or a specific one
export async function GET(request: NextRequest) {
  try {
    console.log("Starting lost items fetch...");

    // Connect to the database with improved error handling
    try {
      await dbConnect();
      console.log("Database connection established");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      // Try the connection once more with direct environment variable loading
      await connectToDatabase();
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const reporter = searchParams.get("reporter"); // Get reporter email parameter

    console.log("Query parameters:", {
      category,
      query,
      page,
      limit,
      reporter,
    });

    // Build the filter object
    const filter: any = {};

    // If reporter email is provided, filter by the reporter
    if (reporter) {
      // First need to find the user with this email
      const reporterUser = await User.findOne({ email: reporter });
      if (reporterUser) {
        // Filter items by reportedBy field (user ID)
        filter.reportedBy = reporterUser._id;
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

    // Add category filter if provided
    if (category) {
      filter.category = category;
    }

    // Add search query if provided
    if (query) {
      filter.$or = [
        { itemName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ];
    }

    console.log("Using filter:", JSON.stringify(filter));

    // Count total items (for pagination)
    const total = await LostItem.countDocuments(filter);
    console.log(`Found ${total} matching items`);

    // Fetch items with pagination
    const lostItems = await LostItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reportedBy", "name email");

    console.log(`Returning ${lostItems.length} items for page ${page}`);

    return NextResponse.json({
      success: true,
      data: lostItems,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching lost items:", error);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch lost items",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
