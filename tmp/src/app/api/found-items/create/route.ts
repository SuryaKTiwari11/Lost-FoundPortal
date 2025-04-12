import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import User from "@/model/user.model";

export async function POST(request: Request) {
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
    console.log("Received found item data:", data);

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

    // Prepare the image data
    let imageURL = null;
    if (data.imageURL) {
      imageURL = data.imageURL;
    } else if (data.images && data.images.length > 0) {
      imageURL = data.images[0]; // Use the first image if available
    }

    // Create a new found item record
    const foundItem = new FoundItem({
      itemName: data.itemName,
      description: data.description,
      category: data.category,
      foundLocation: data.foundLocation,
      foundDate: new Date(data.foundDate),
      currentHoldingLocation: data.currentHoldingLocation,
      reportedBy: user._id, // Use the MongoDB ObjectId from the user document
      imageURL: imageURL,
      images: data.images || [],
      status: "pending", // All new items start as pending
      isVerified: false, // Needs to be verified by admin
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      verificationSteps: {
        imageVerified: false,
        locationVerified: false,
        descriptionVerified: false,
        categoryVerified: false,
      },
    });

    // Save the item to the database
    const savedItem = await foundItem.save();
    console.log("Item saved to database with ID:", savedItem._id);

    return NextResponse.json({
      success: true,
      message: "Item reported successfully",
      itemId: savedItem._id,
    });
  } catch (error: any) {
    console.error("Error reporting found item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to report found item",
      },
      { status: 500 }
    );
  }
}
