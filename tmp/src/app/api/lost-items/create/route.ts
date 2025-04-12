import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import LostItemModel from "@/model/lostItem.model";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse the request body
    const data = await request.json();

    console.log("Received lost item data:", data);
    console.log("Current user session:", session.user);

    // Ensure required fields are present
    if (!data.itemName) {
      return NextResponse.json(
        { success: false, error: "Item name is required" },
        { status: 400 }
      );
    }

    if (!data.lastLocation) {
      return NextResponse.json(
        { success: false, error: "Last known location is required" },
        { status: 400 }
      );
    }

    if (!data.dateLost) {
      return NextResponse.json(
        { success: false, error: "Date when item was lost is required" },
        { status: 400 }
      );
    }

    // Find or create the user in MongoDB based on email
    let user;
    try {
      user = await User.findOne({ email: session.user.email });

      if (!user && session.user.email) {
        // Create a new user if they don't exist in the database yet
        user = await User.create({
          email: session.user.email,
          name: session.user.name || "User",
          image: session.user.image || "",
          role: "user",
        });
        console.log("Created new user:", user._id);
      }

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User account not found" },
          { status: 400 }
        );
      }
    } catch (userError) {
      console.error("Error finding/creating user:", userError);
      return NextResponse.json(
        { success: false, error: "Failed to process user account" },
        { status: 500 }
      );
    }

    // Create a new lost item record with valid status and proper user reference
    const lostItem = new LostItemModel({
      ...data,
      status: "lost", // Using "lost" which is a valid value in the enum
      reportedBy: user._id, // Use the MongoDB ObjectId from the user document
      contactEmail: data.contactEmail || session.user.email,
    });

    console.log("Lost item object before save:", lostItem);

    // Save the item to the database
    const savedItem = await lostItem.save();
    console.log("Item saved successfully:", savedItem._id);

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
