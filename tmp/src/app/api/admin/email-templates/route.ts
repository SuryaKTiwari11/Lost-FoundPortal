import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { notificationService } from "@/services/admin/notification.service";
import { validateCreateEmailTemplate } from "@/validators/admin/email-template.validator";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";

/**
 * GET handler for retrieving all email templates
 */
export async function GET(request: NextRequest) {
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

    // Call the notification service to get email templates
    const result = await notificationService.getEmailTemplates();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error retrieving email templates:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve email templates",
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new email template
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
    const validationResult = validateCreateEmailTemplate(data);

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

    const { name, subject, body, type } = validationResult.data;

    // Call the notification service to create the email template
    const result = await notificationService.createEmailTemplate(
      name,
      subject,
      body,
      type,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating email template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create email template",
      },
      { status: 500 }
    );
  }
}
