import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import LostItem from "@/model/lostItem.model";
import FoundItem from "@/model/foundItem.model";
import ItemMatch from "@/model/itemMatch.model";
import User from "@/model/user.model";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
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
      (lostItem.reportedBy.email || lostItem.reportedBy.universityEmail)
    ) {
      const userEmail =
        lostItem.reportedBy.email || lostItem.reportedBy.universityEmail;

      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const portalURL = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Good News! Your Lost Item May Have Been Found</h2>
          <p>We're pleased to inform you that an item matching the description of your lost "${lostItem.itemName}" has been found and is currently at our Lost & Found office.</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <h3 style="margin-top: 0;">Item Details:</h3>
            <p><strong>Item:</strong> ${foundItem.itemName}</p>
            <p><strong>Category:</strong> ${foundItem.category}</p>
            <p><strong>Found Location:</strong> ${foundItem.foundLocation}</p>
            <p><strong>Date Found:</strong> ${new Date(foundItem.foundDate).toLocaleDateString()}</p>
          </div>
          
          <p>To claim this item, please visit our Lost & Found office with appropriate identification and proof of ownership.</p>
          
          <a href="${portalURL}/claim/${foundItem._id}" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Found Item</a>
          
          <p style="margin-top: 20px;">Office Hours:</p>
          <ul>
            <li>Monday - Friday: 9:00 AM - 5:00 PM</li>
            <li>Saturday: 10:00 AM - 2:00 PM</li>
          </ul>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
            <p>This is an automated message from the Lost & Found Portal.</p>
          </div>
        </div>
      `;

      // For demo purposes, log the email instead of sending
      console.log(`Would send email to: ${userEmail}`);
      console.log(`Subject: Your Lost Item Has Been Found`);
      console.log(`Body: ${emailHTML.substring(0, 100)}...`);

      // Uncomment to actually send the email
      /*
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Your Lost Item Has Been Found",
        html: emailHTML,
      });
      */
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
