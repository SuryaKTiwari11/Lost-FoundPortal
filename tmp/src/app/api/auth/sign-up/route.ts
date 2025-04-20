"use server";
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth/auth.service";
import { validateSignUp } from "@/validators/auth/auth.validator";
import bcrypt from "bcryptjs";
import { format } from "date-fns";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import { generateUsername } from "@/helper/generateUsername";

/**
 * POST handler for user signup
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const data = await request.json();

    const validationResult = validateSignUp(data);
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

    // Call the service to sign up the user
    const result = await authService.signUp(validationResult.data);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error signing up user:", error);

    if (error.message === "User with this email already exists") {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to sign up user",
      },
      { status: 500 }
    );
  }
}
