import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import EmailTemplate from "@/model/emailTemplate.model";
import type { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const template = await EmailTemplate.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Email template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error retrieving email template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, subject, body: emailBody, type } = body;

    if (!name || !subject || !emailBody) {
      return NextResponse.json(
        { success: false, error: "Name, subject, and body are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if template exists
    const template = await EmailTemplate.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Email template not found" },
        { status: 404 }
      );
    }

    // Make sure the name is unique if it was changed
    if (name !== template.name) {
      const existingTemplate = await EmailTemplate.findOne({ name });
      if (existingTemplate) {
        return NextResponse.json(
          { success: false, error: "A template with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Update the template
    template.name = name;
    template.subject = subject;
    template.body = emailBody;
    if (type) {
      template.type = type;
    }

    await template.save();

    return NextResponse.json({
      success: true,
      message: "Email template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error updating email template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if template exists and is not a default template
    const template = await EmailTemplate.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Email template not found" },
        { status: 404 }
      );
    }

    // Protect default templates
    if (template.isDefault) {
      return NextResponse.json(
        { success: false, error: "Cannot delete default templates" },
        { status: 403 }
      );
    }

    await EmailTemplate.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Email template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting email template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
