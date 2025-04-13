import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import ClaimRequest from "@/model/claimRequest.model";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import { sendEmail, emailTemplates } from "@/lib/email";
import type { ApiResponse } from "@/types";

export async function PUT(
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
    const { claimId, approved, adminNotes } = body;

    if (!claimId) {
      return NextResponse.json(
        { success: false, error: "Claim ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the claim request
    const claim = await ClaimRequest.findById(claimId)
      .populate("item")
      .populate("user");

    if (!claim) {
      return NextResponse.json(
        { success: false, error: "Claim request not found" },
        { status: 404 }
      );
    }

    // Update claim status and add admin notes if provided
    claim.status = approved ? "approved" : "rejected";
    claim.processedBy = session.user.id;
    claim.processedAt = new Date();

    if (adminNotes) {
      claim.adminNotes = adminNotes;
    }

    await claim.save();

    // If claim is approved, update the item as claimed
    if (approved) {
      const foundItem = await FoundItem.findById(claim.item._id);

      if (foundItem) {
        foundItem.status = "claimed";
        foundItem.claimedBy = claim.user._id;
        foundItem.claimedAt = new Date();

        // If this item was matched with a lost item, update the lost item status too
        if (foundItem.matchedWithLostItem) {
          await LostItem.findByIdAndUpdate(foundItem.matchedWithLostItem, {
            status: "claimed",
          });
        }

        await foundItem.save();
      }
    }

    // Send notification email to user
    const userEmail =
      claim.user?.email ||
      (typeof claim.user === "object" && "universityEmail" in claim.user)
        ? claim.user.universityEmail
        : null;

    if (userEmail) {
      try {
        if (approved) {
          // Send approval email
          const emailData = {
            itemName: claim.item.itemName,
            userName: claim.user?.name || "User",
            pickupLocation: "Lost & Found Office, Admin Building",
            contactPerson: "Lost & Found Administrator",
            pickupInstructions:
              "Please bring your ID card for verification when collecting the item.",
          };

          const emailTemplate = emailTemplates.claimApproved(emailData);

          await sendEmail({
            to: userEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
        } else {
          // Send rejection email
          const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h2 style="color: #222; border-bottom: 1px solid #eee; padding-bottom: 10px;">Claim Not Approved</h2>
              
              <p>Hello ${claim.user?.name || "User"},</p>
              
              <p>We're sorry, but your claim for the item "${claim.item.itemName}" has not been approved.</p>
              
              <p>This could be due to insufficient proof of ownership or because another person has been verified as the rightful owner.</p>
              
              <p>If you have any questions or wish to provide additional information, please contact the Lost & Found office directly.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
                <p>This is an automated message from the Lost & Found Portal.</p>
              </div>
            </div>
          `;

          await sendEmail({
            to: userEmail,
            subject: `Your Claim for ${claim.item.itemName} has been Rejected`,
            html: emailHTML,
          });
        }
        console.log(`Email sent successfully to ${userEmail}`);
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error("Failed to send notification email:", emailError);
      }
    } else {
      console.warn("No valid email found for user, notification not sent");
    }

    return NextResponse.json({
      success: true,
      message: approved
        ? "Claim approved successfully"
        : "Claim rejected successfully",
    });
  } catch (error: any) {
    console.error("Error processing claim:", error);
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
