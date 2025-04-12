import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import mongoose from "mongoose";

// GET handler to retrieve a single found item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await dbConnect();

    // Validate ID format
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid item ID format",
        },
        { status: 400 }
      );
    }

    // Find the found item by ID
    const foundItem = await FoundItem.findById(id)
      .populate("reportedBy", "name email username")
      .lean();

    // If no item found, return 404
    if (!foundItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Found item not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: foundItem,
    });
  } catch (error: any) {
    console.error(`Error fetching found item with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch found item",
      },
      { status: 500 }
    );
  }
}

// PUT handler to update a found item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await dbConnect();

    // Validate ID format
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid item ID format",
        },
        { status: 400 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Update the found item
    const updatedItem = await FoundItem.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate("reportedBy", "name email username");

    // If no item found to update, return 404
    if (!updatedItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Found item not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error: any) {
    console.error(`Error updating found item with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update found item",
      },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a found item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await dbConnect();

    // Validate ID format
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid item ID format",
        },
        { status: 400 }
      );
    }

    // Delete the found item
    const deletedItem = await FoundItem.findByIdAndDelete(id);

    // If no item found to delete, return 404
    if (!deletedItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Found item not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Found item deleted successfully" },
    });
  } catch (error: any) {
    console.error(`Error deleting found item with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete found item",
      },
      { status: 500 }
    );
  }
}
