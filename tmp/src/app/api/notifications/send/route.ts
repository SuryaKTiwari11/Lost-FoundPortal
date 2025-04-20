import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import { CommunicationHistory } from "@/model/communicationHistory.model";
import { sendEmail } from "@/lib/email";
import type { ApiResponse } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Parse request body
    const body = await request.json();
    const { userId, subject, message, itemId, itemType } = body;

    if (!userId || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "User ID, subject, and message are required" },
        { status: 400 }
      );
    }

    // Find the recipient user
    const recipient = await User.findById(userId);
    if (!recipient || !recipient.email) {
      return NextResponse.json(
        { success: false, error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Find the sender
    const sender = await User.findById(session.user.id);
    if (!sender) {
      return NextResponse.json(
        { success: false, error: "Sender information not found" },
        { status: 404 }
      );
    }

    // Send the email
    await sendEmail({
      to: recipient.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">${subject}</h2>
          <p style="color: #555; line-height: 1.5;">${message}</p>
          <p style="color: #777; margin-top: 20px;">This message was sent from the Lost & Found Portal by ${sender.name || sender.email}</p>
        </div>
      `,
    });

    // Record communication in database
    const communication = new CommunicationHistory({
      sender: session.user.id,
      recipient: userId,
      subject,
      message,
      itemId,
      itemType,
      sentAt: new Date(),
    });

    await communication.save();

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
