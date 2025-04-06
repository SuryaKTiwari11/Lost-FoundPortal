import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import ClaimRequest from "@/model/claimRequest.model";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import nodemailer from "nodemailer";

export async function PUT(request: NextRequest) {
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
    const userEmail = claim.user.email || claim.user.universityEmail;

    if (userEmail) {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const emailSubject = approved
        ? `Your claim for ${claim.item.itemName} has been approved`
        : `Your claim for ${claim.item.itemName} has been rejected`;

      const emailHTML = approved
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Claim Approved!</h2>
            <p>Your claim for the item "${claim.item.itemName}" has been approved.</p>
            <p>You can collect your item from the Lost & Found office at the following hours:</p>
            <ul>
              <li>Monday - Friday: 9:00 AM - 5:00 PM</li>
              <li>Saturday: 10:00 AM - 2:00 PM</li>
            </ul>
            <p>Please bring your ID card for verification when collecting the item.</p>
            <p>If you have any questions, please reply to this email or contact the office directly.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
              <p>This is an automated message from the Lost & Found Portal.</p>
            </div>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Claim Not Approved</h2>
            <p>We're sorry, but your claim for the item "${claim.item.itemName}" has not been approved.</p>
            <p>This could be due to insufficient proof of ownership or because another person has been verified as the rightful owner.</p>
            <p>If you have any questions or wish to provide additional information, please contact the Lost & Found office directly.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
              <p>This is an automated message from the Lost & Found Portal.</p>
            </div>
          </div>
        `;

      // For demo purposes, log the email instead of sending
      console.log(`Would send email to: ${userEmail}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Body: ${emailHTML.substring(0, 100)}...`);

      // Uncomment to actually send the email
      /*
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: emailSubject,
        html: emailHTML,
      });
      */
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
