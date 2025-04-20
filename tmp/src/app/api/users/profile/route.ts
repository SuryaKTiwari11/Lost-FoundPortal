import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { userService } from "@/services/users/user.service";
import { validateUpdateProfile } from "@/validators/user/profile.validator";

/**
 * GET handler to fetch a user profile
 */
export async function GET(request: NextRequest) {
  try {
    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Only allow users to access their own profile unless they are an admin
    if (email !== session.user.email && session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Call the service to get the user profile
    const result = await userService.getUserByEmail(email);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching user profile:", error);

    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch user profile",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update a user profile
 */
export async function PUT(request: NextRequest) {
  try {
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
    const email = data.email;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Only allow users to update their own profile unless they are an admin
    if (email !== session.user.email && session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Validate profile data
    const validationResult = validateUpdateProfile(data);
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

    // Call the service to update the user profile
    const result = await userService.updateUserProfile(
      email,
      validationResult.data
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating user profile:", error);

    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update user profile",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to delete a user account
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Only allow users to delete their own account unless they are an admin
    if (email !== session.user.email && session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Call the service to delete the user account
    const result = await userService.deleteUserAccount(email);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error deleting user account:", error);

    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete user account",
      },
      { status: 500 }
    );
  }
}
