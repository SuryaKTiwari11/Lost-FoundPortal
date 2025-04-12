import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import type { ApiResponse } from "@/types";

export async function PUT(
  request: Request
): Promise<NextResponse<ApiResponse>> {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { itemId, status, itemType } = body;

    if (!itemId || !status) {
      return NextResponse.json(
        { success: false, error: "Item ID and status are required" },
        { status: 400 }
      );
    }

    // Common update options for both item types
    const updateOptions = {
      status,
      ...(status === "verified" ? { isVerified: true } : {}),
      ...(status === "pending" ? { isVerified: false } : {}),
    };

    let updatedItem;

    // Try to update as lost item first
    try {
      updatedItem = await LostItem.findByIdAndUpdate(itemId, updateOptions, {
        new: true,
      });
    } catch (error) {
      console.log("Not a lost item, trying found item");
    }

    // If not a lost item, try to update as found item
    if (!updatedItem) {
      try {
        updatedItem = await FoundItem.findByIdAndUpdate(itemId, updateOptions, {
          new: true,
        });
      } catch (error) {
        console.error("Error updating found item:", error);
      }
    }

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Item status updated to ${status}`,
      item: updatedItem,
    });
  } catch (error: any) {
    console.error("Error updating item status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update item status",
      },
      { status: 500 }
    );
  }
}
