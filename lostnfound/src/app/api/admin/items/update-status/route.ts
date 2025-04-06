import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId, status } = body;

    if (!itemId || !status) {
      return NextResponse.json(
        { success: false, error: "Item ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    if (!["found", "claimed", "verified", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update item based on status
    let updateData: any = { status };

    if (status === "verified") {
      updateData = { status: "found", isVerified: true };
    } else if (status === "rejected") {
      updateData = { status: "rejected", isVerified: false };
    }

    const updatedItem = await FoundItem.findByIdAndUpdate(itemId, updateData, {
      new: true,
    });

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("Error updating item status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
