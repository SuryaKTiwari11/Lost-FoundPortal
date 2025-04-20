import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth/auth.service";
import { validateVerifyEmail } from "@/validators/auth/auth.validator";

/**
 * POST handler for email verification
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const data = await request.json();

    const validationResult = validateVerifyEmail(data);
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

    // Call the service to verify the email
    const result = await authService.verifyEmail(
      validationResult.data.email,
      validationResult.data.code
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error verifying email:", error);

    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (error.message === "Invalid verification code") {
      return NextResponse.json(
        { success: false, error: "Invalid verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify email",
      },
      { status: 500 }
    );
  }
}
