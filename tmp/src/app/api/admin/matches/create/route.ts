import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";
import FoundItem from "@/model/foundItem.model";
import ItemMatch from "@/model/itemMatch.model";
import { sendEmail, emailTemplates } from "@/lib/email";
import type { ApiResponse } from "@/types";

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
    const { lostItemId, foundItemId } = body;

    if (!lostItemId || !foundItemId) {
      return NextResponse.json(
        { success: false, error: "Both lost and found item IDs are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the items
    const lostItem = await LostItem.findById(lostItemId).populate("reportedBy");
    const foundItem = await FoundItem.findById(foundItemId);

    if (!lostItem || !foundItem) {
      return NextResponse.json(
        { success: false, error: "One or both items not found" },
        { status: 404 }
      );
    }

    // Check if the found item is already claimed
    if (foundItem.status === "claimed") {
      return NextResponse.json(
        { success: false, error: "Found item is already claimed" },
        { status: 400 }
      );
    }

    // Check if either item is already matched
    if (lostItem.matchedWithFoundItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Lost item is already matched with another found item",
        },
        { status: 400 }
      );
    }

    if (foundItem.matchedWithLostItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Found item is already matched with another lost item",
        },
        { status: 400 }
      );
    }

    // Create a match record
    const newMatch = new ItemMatch({
      lostItem: lostItemId,
      foundItem: foundItemId,
      matchedBy: session.user.id,
      matchType: "manual", // admin matched these items manually
      status: "pending", // pending user confirmation
    });

    await newMatch.save();

    // Update the lost item status
    lostItem.matchedWithFoundItem = foundItemId;
    lostItem.status = "pending_claim"; // waiting for the owner to claim
    await lostItem.save();

    // Update the found item to reference this match
    foundItem.matchedWithLostItem = lostItemId;
    await foundItem.save();

    // Send notification email to the person who reported the lost item
    if (
      lostItem.reportedBy &&
      (lostItem.reportedBy.email || lostItem.contactEmail)
    ) {
      const userEmail =
        typeof lostItem.reportedBy === "object"
          ? lostItem.reportedBy.email
          : lostItem.contactEmail;

      if (userEmail) {
        const portalURL = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const itemDetailsUrl = `${portalURL}/item/${foundItem._id}`;

        // Use email template
        const emailData = {
          userName:
            typeof lostItem.reportedBy === "object"
              ? lostItem.reportedBy.name
              : "User",
          lostItemName: lostItem.itemName,
          foundItemName: foundItem.itemName,
          matchConfidence: "High",
          itemDetailsUrl,
        };

        const emailTemplate = emailTemplates.newItemMatched(emailData);

        await sendEmail({
          to: userEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Items matched successfully",
      data: {
        matchId: newMatch._id,
      },
    });
  } catch (error) {
    console.error("Error creating item match:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
