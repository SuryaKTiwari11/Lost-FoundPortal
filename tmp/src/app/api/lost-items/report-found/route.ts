import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";
import FoundReport from "@/model/foundReport.model";
import { foundReportSchema } from "@/schemas/foundReportSchema";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    console.log("Received found report data:", body);

    try {
      // Validate with Zod schema
      foundReportSchema.parse(body);
    } catch (validationError: any) {
      console.error("Validation error:", validationError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form data",
          details: validationError.errors,
        },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if the lost item exists
    const lostItem = await LostItem.findById(body.lostItemId);
    if (!lostItem) {
      return NextResponse.json(
        { success: false, error: "Lost item not found" },
        { status: 404 }
      );
    }

    // Create a new found report
    const foundReport = new FoundReport({
      lostItem: body.lostItemId,
      foundBy: session.user.id,
      foundLocation: body.foundLocation,
      foundDate: new Date(body.foundDate),
      currentHoldingLocation: body.currentHoldingLocation,
      additionalNotes: body.additionalNotes || "",
      contactPhone: body.contactPhone || "",
      status: "pending", // Initial status (pending admin verification)
    });

    // Save the found report
    await foundReport.save();

    // Update the lost item status
    lostItem.status = "foundReported"; // Custom status to indicate someone reported finding it
    lostItem.foundReports = [...(lostItem.foundReports || []), foundReport._id];
    await lostItem.save();

    // Optional: Send notification to the item owner

    return NextResponse.json({
      success: true,
      message: "Found item report submitted successfully",
      data: {
        reportId: foundReport._id,
      },
    });
  } catch (error: any) {
    console.error("Error reporting found item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit found item report",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
