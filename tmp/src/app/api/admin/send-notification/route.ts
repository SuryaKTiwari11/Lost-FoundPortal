import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { notificationService } from "@/services/admin/notification.service";
import { validateNotification } from "@/validators/admin/notification.validator";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";

/**
 * POST handler for sending notifications to users
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify admin access
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin privileges required" },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const data = await request.json();
    const validationResult = validateNotification(data);

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

    const { subject, body, itemIds } = validationResult.data;

    // Call the notification service to send notifications
    const result = await notificationService.sendNotification(
      subject,
      body,
      itemIds,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send notifications",
      },
      { status: 500 }
    );
  }
}
