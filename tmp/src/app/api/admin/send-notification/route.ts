import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import User from "@/model/user.model";
import { sendEmail } from "@/lib/email";
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
    const { subject, body: emailBody, itemIds } = body;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { success: false, error: "Subject and email body are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get email recipients (all users with @thapar.edu emails)
    const users = await User.find({
      email: { $regex: /@thapar\.edu$/ },
    }).select("email name");

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "No recipients found" },
        { status: 404 }
      );
    }

    // If specific items are selected, include their details
    let itemsHTML = "";
    if (itemIds && itemIds.length > 0) {
      const items = await FoundItem.find({ _id: { $in: itemIds } }).select(
        "itemName category foundLocation foundDate imageURL"
      );

      if (items.length > 0) {
        itemsHTML = `
          <h3 style="margin-top: 20px; margin-bottom: 10px;">Items Information:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Item Name</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Category</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Location Found</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Date Found</th>
            </tr>
            ${items
              .map(
                (item) => `
              <tr>
                <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${item.itemName}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${item.category}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${item.foundLocation}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${new Date(item.foundDate).toLocaleDateString()}</td>
              </tr>
            `
              )
              .join("")}
          </table>
        `;
      }
    }

    // Create email HTML
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <div style="margin: 20px 0; line-height: 1.5;">
          ${emailBody.replace(/\n/g, "<br>")}
        </div>
        ${itemsHTML}
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
          <p>This is an automated message from the Thapar Lost & Found Portal.</p>
          <p>Please do not reply to this email. If you have questions, visit the Lost & Found office.</p>
        </div>
      </div>
    `;

    // Send email to all recipients
    const emailPromises = users.map((user) =>
      sendEmail({
        to: user.email,
        subject: subject,
        html: emailHTML,
      })
    );

    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${users.length} recipients`,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
