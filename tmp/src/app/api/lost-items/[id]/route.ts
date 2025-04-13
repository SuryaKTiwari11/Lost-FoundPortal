import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";

// GET handler to retrieve a specific lost item by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Access params correctly in App Router
    const params = await Promise.resolve(context.params);
    const { id } = params;

    const lostItem = await LostItem.findById(id)
      .populate("reportedBy", "name email username")
      .lean();

    if (!lostItem) {
      return NextResponse.json(
        { success: false, error: "Lost item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lostItem });
  } catch (error: any) {
    console.error(`Error fetching lost item:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch lost item",
      },
      { status: 500 }
    );
  }
}

// PUT handler to update a lost item
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Access params correctly in App Router
    const params = await Promise.resolve(context.params);
    const { id } = params;

    const data = await request.json();

    const updatedItem = await LostItem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: "Lost item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: any) {
    console.error(`Error updating lost item:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update lost item",
      },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a lost item
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Access params correctly in App Router
    const params = await Promise.resolve(context.params);
    const { id } = params;

    const deletedItem = await LostItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json(
        { success: false, error: "Lost item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lost item deleted successfully",
    });
  } catch (error: any) {
    console.error(`Error deleting lost item:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete lost item",
      },
      { status: 500 }
    );
  }
}
