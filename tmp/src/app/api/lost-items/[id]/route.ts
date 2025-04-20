import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { lostItemsService } from "@/services/items/lostItems.service";
import { validateUpdateLostItem } from "@/validators/items/lostItems.validator";

interface Params {
  params: {
    id: string;
  };
}

/**
 * GET handler to fetch a specific lost item by ID
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    const result = await lostItemsService.getLostItemById(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error fetching lost item with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch lost item",
      },
      { status: error.message === "Lost item not found" ? 404 : 500 }
    );
  }
}

/**
 * PUT handler to update a specific lost item by ID
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const data = await request.json();

    const validationResult = validateUpdateLostItem(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Call the service to update the lost item
    const result = await lostItemsService.updateLostItem(
      id,
      validationResult.data,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error updating lost item with ID ${params.id}:`, error);

    if (error.message === "Lost item not found") {
      return NextResponse.json(
        { success: false, error: "Lost item not found" },
        { status: 404 }
      );
    }

    if (error.message === "You are not authorized to update this item") {
      return NextResponse.json(
        { success: false, error: "You are not authorized to update this item" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update lost item",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to delete a specific lost item by ID
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Call the service to delete the lost item
    const result = await lostItemsService.deleteLostItem(id, session.user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error deleting lost item with ID ${params.id}:`, error);

    if (error.message === "Lost item not found") {
      return NextResponse.json(
        { success: false, error: "Lost item not found" },
        { status: 404 }
      );
    }

    if (error.message === "You are not authorized to delete this item") {
      return NextResponse.json(
        { success: false, error: "You are not authorized to delete this item" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete lost item",
      },
      { status: 500 }
    );
  }
}
