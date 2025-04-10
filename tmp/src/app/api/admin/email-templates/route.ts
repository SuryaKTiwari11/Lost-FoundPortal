import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import EmailTemplate from "@/model/emailTemplate.model";
import type { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get the type filter from query parameters
    const type = request.nextUrl.searchParams.get("type");
    let query = {};

    if (type) {
      query = { type };
    }

    const templates = await EmailTemplate.find(query).sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error retrieving email templates:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, subject, body: emailBody, type = "notification" } = body;

    if (!name || !subject || !emailBody) {
      return NextResponse.json(
        { success: false, error: "Name, subject, and body are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if a template with this name already exists
    const existingTemplate = await EmailTemplate.findOne({ name });
    if (existingTemplate) {
      return NextResponse.json(
        { success: false, error: "A template with this name already exists" },
        { status: 409 }
      );
    }

    // Create new template
    const template = new EmailTemplate({
      name,
      subject,
      body: emailBody,
      type,
      createdBy: session.user.id,
    });

    await template.save();

    return NextResponse.json({
      success: true,
      message: "Email template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error creating email template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
