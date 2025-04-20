import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { claimsService } from "@/services/claims.service";
import type { ApiResponse } from "@/types";

/**
 * PUT handler for processing claim requests by admin
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { claimId, approved, adminNotes } = body;

    if (!claimId) {
      return NextResponse.json(
        { success: false, error: "Claim ID is required" },
        { status: 400 }
      );
    }

    // Call the claims service to process the claim
    const result = await claimsService.processClaim(
      claimId,
      approved,
      adminNotes,
      session.user.id
    );

    // Return appropriate HTTP status based on the result
    if (!result.success) {
      const status = result.error === "Claim request not found" ? 404 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing claim:", error);
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
