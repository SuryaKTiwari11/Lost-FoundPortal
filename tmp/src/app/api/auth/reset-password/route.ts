import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth/auth.service";
import { validateResetPassword } from "@/validators/auth/auth.validator";

/**
 * POST handler for password reset
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const data = await request.json();

    const validationResult = validateResetPassword(data);
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

    // Call the service to reset password
    const result = await authService.resetPassword(
      validationResult.data.email,
      validationResult.data.code,
      validationResult.data.newPassword
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error resetting password:", error);

    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (error.message === "Invalid reset code") {
      return NextResponse.json(
        { success: false, error: "Invalid reset code" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reset password",
      },
      { status: 500 }
    );
  }
}
