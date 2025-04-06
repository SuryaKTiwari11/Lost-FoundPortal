import nodemailer from "nodemailer";

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email templates
export const emailTemplates = {
  claimSubmitted: (data: {
    itemName: string;
    userName: string;
    foundDate: Date;
    adminUrl: string;
  }) => ({
    subject: `Claim Submitted for ${data.itemName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #222; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Claim Submitted</h2>
        
        <p>Hello Admin,</p>
        
        <p>A new claim has been submitted for a found item:</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Item:</strong> ${data.itemName}</p>
          <p><strong>Claimed by:</strong> ${data.userName}</p>
          <p><strong>Item found on:</strong> ${new Date(data.foundDate).toLocaleDateString()}</p>
        </div>
        
        <p>Please review this claim in the admin dashboard:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${data.adminUrl}" style="background-color: #FFD166; color: #121212; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Review Claim
          </a>
        </div>
        
        <p>Thank you,<br>Lost & Found Portal</p>
      </div>
    `,
  }),

  claimApproved: (data: {
    itemName: string;
    userName: string;
    pickupLocation: string;
    contactPerson: string;
    pickupInstructions?: string;
  }) => ({
    subject: `Your Claim for ${data.itemName} has been Approved`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #222; border-bottom: 1px solid #eee; padding-bottom: 10px;">Claim Approved!</h2>
        
        <p>Hello ${data.userName},</p>
        
        <p>Good news! Your claim for the <strong>${data.itemName}</strong> has been approved.</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #121212;">Pickup Information:</h3>
          <p><strong>Location:</strong> ${data.pickupLocation}</p>
          <p><strong>Contact Person:</strong> ${data.contactPerson}</p>
          ${data.pickupInstructions ? `<p><strong>Instructions:</strong> ${data.pickupInstructions}</p>` : ""}
        </div>
        
        <p>Please bring your ID for verification when collecting your item.</p>
        
        <p>Thank you for using the Lost & Found portal!</p>
        
        <p>Best regards,<br>Lost & Found Team</p>
      </div>
    `,
  }),

  newItemMatched: (data: {
    userName: string;
    lostItemName: string;
    foundItemName: string;
    matchConfidence: string;
    itemDetailsUrl: string;
  }) => ({
    subject: `Potential Match Found for Your Lost ${data.lostItemName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #222; border-bottom: 1px solid #eee; padding-bottom: 10px;">Potential Match Found!</h2>
        
        <p>Hello ${data.userName},</p>
        
        <p>Good news! Someone has reported finding an item that may match the ${data.lostItemName} you reported as lost.</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Found Item:</strong> ${data.foundItemName}</p>
          <p><strong>Match Confidence:</strong> ${data.matchConfidence}</p>
        </div>
        
        <p>Please check the item details and submit a claim if you believe this is your item:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${data.itemDetailsUrl}" style="background-color: #FFD166; color: #121212; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Item Details
          </a>
        </div>
        
        <p>Thank you for using the Lost & Found portal!</p>
        
        <p>Best regards,<br>Lost & Found Team</p>
      </div>
    `,
  }),
};

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "Lost & Found <noreply@lostandfound.com>",
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
