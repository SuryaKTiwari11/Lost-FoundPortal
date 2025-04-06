import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const item = await LostItem.findById(id)
      .populate("reportedBy", "name email image")
      .populate({
        path: "foundReports",
        populate: {
          path: "foundBy",
          select: "name email image",
        },
      })
      .populate("matchedWithFoundItem");

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error("Error fetching lost item:", error);
    return NextResponse.json(
      { success: false, error: `Failed to fetch item: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    await dbConnect();

    // Get the item first to check permissions
    const item = await LostItem.findById(id);

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Check if user is authorized to update this item
    if (
      item.reportedBy.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to update this item",
        },
        { status: 403 }
      );
    }

    // Update the item
    const updatedItem = await LostItem.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating lost item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the item first to check permissions
    const item = await LostItem.findById(id);

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Check if user is authorized to delete this item
    if (
      item.reportedBy.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete this item",
        },
        { status: 403 }
      );
    }

    // Delete the item
    await LostItem.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lost item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
