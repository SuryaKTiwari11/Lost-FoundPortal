import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { adminService } from "@/services/admin/admin.service";
import { validateUpdateClaimRequest } from "@/validators/admin/admin.validator";

interface Params {
  params: {
    id: string;
  };
}

/**
 * PUT handler to update a claim request status as admin
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Claim request ID is required" },
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

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const data = await request.json();

    const validationResult = validateUpdateClaimRequest(data);
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

    // Call the service to update the claim request
    const result = await adminService.updateClaimRequest(
      id,
      validationResult.data.status,
      validationResult.data.adminNotes
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error updating claim request with ID ${params.id}:`, error);

    if (error.message === "Claim request not found") {
      return NextResponse.json(
        { success: false, error: "Claim request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update claim request",
      },
      { status: 500 }
    );
  }
}
