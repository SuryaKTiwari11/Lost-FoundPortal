import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { foundItemsService } from "@/services/items/foundItems.service";
import { validateUpdateFoundItem } from "@/validators/items/foundItems.validator";

interface Params {
  params: {
    id: string;
  };
}

/**
 * GET handler to fetch a specific found item by ID
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

    const result = await foundItemsService.getFoundItemById(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error fetching found item with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch found item",
      },
      { status: error.message === "Found item not found" ? 404 : 500 }
    );
  }
}

/**
 * PUT handler to update a specific found item by ID
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

    const validationResult = validateUpdateFoundItem(data);
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

    // Call the service to update the found item
    const result = await foundItemsService.updateFoundItem(
      id,
      validationResult.data,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error updating found item with ID ${params.id}:`, error);

    if (error.message === "Found item not found") {
      return NextResponse.json(
        { success: false, error: "Found item not found" },
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
        error: error.message || "Failed to update found item",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to delete a specific found item by ID
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

    // Call the service to delete the found item
    const result = await foundItemsService.deleteFoundItem(id, session.user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error deleting found item with ID ${params.id}:`, error);

    if (error.message === "Found item not found") {
      return NextResponse.json(
        { success: false, error: "Found item not found" },
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
        error: error.message || "Failed to delete found item",
      },
      { status: 500 }
    );
  }
}
