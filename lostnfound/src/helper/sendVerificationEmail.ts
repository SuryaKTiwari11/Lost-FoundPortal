import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmails";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?code=${verifyCode}`;

    // Send email using Resend
    await resend.emails.send({
      from: "onboard@resend.dev",
      to: email,
      subject: "Lost and Found Portal - Verification Code",
      react: VerificationEmail({
        url: verificationUrl,
        username: username, // This now uses the actual username from the schema
        expiryTime: "24 hours",
      }),
    });

    return {
      success: true,
      data: "Verification email sent successfully",
    };
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      error: "Failed to send verification email",
    };
  }
}
