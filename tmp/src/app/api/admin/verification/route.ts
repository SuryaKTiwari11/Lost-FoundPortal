import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { verificationService } from "@/services/admin/verification.service";
import type { ApiResponse } from "@/types";
import { z } from "zod";

// Validation schema for verification requests
const verificationSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  stepType: z.enum(["photo", "description", "ownershipProof"], {
    errorMap: () => ({ message: "Valid step type is required" }),
  }),
  verified: z.boolean(),
  notes: z.string().optional(),
});

/**
 * POST handler for processing verification steps
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = verificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { itemId, stepType, verified, notes } = validation.data;

    // Call the verification service
    const result = await verificationService.verifyItemStep({
      itemId,
      stepType,
      verified,
      notes,
      adminId: session.user.id,
    });

    // Return appropriate HTTP status based on the result
    if (!result.success) {
      const status = result.error === "Item not found" ? 404 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in verification API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for retrieving verification details
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get item ID from query parameters
    const itemId = request.nextUrl.searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Call the verification service
    const result = await verificationService.getVerificationDetails(itemId);

    // Return appropriate HTTP status based on the result
    if (!result.success) {
      const status = result.error === "Item not found" ? 404 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error retrieving verification data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
