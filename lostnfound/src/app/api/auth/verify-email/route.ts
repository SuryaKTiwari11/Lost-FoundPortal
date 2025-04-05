import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    if (!code || !email) {
      return NextResponse.json(
        { success: false, message: "Missing verification parameters" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user by email and verification code
    const user = await User.findOne({
      universityEmail: email,
      verifyCode: code,
      isVerified: false,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code or email" },
        { status: 404 }
      );
    }

    // Check if verification code has expired
    const now = new Date();
    const expiryDate = new Date(user.verifyCodeExpiry);

    if (now > expiryDate) {
      return NextResponse.json(
        { success: false, message: "Verification link has expired" },
        { status: 410 }
      );
    }

    // Mark user as verified and clear verification code
    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;
    await user.save();

    // Redirect to login page with success message
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?verified=true`
    );
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify email" },
      { status: 500 }
    );
  }
}
