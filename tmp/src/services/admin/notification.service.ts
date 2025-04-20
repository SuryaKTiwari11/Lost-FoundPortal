import { ApiResponse } from "@/types/ApiResponse";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import FoundItem from "@/model/foundItem.model";
import LostItem from "@/model/lostItem.model";
import EmailTemplate from "@/model/emailTemplate.model";
import CommunicationHistory from "@/model/communicationHistory.model";
import { sendEmail } from "@/lib/email";

/**
 * Service for handling email notifications
 */
export class NotificationService {
  /**
   * Send notification to users based on item IDs or to all users
   */
  async sendNotification(
    subject: string,
    body: string,
    itemIds?: string[],
    adminId?: string
  ): Promise<ApiResponse> {
    try {
      await dbConnect();

      let userEmails: string[] = [];
      let itemDetails: any[] = [];

      // If item IDs are provided, send only to those item owners
      if (itemIds && itemIds.length > 0) {
        // Get found items
        const foundItems = await FoundItem.find({
          _id: { $in: itemIds },
        }).populate("reportedBy", "email name");

        // Get lost items
        const lostItems = await LostItem.find({
          _id: { $in: itemIds },
        }).populate("reportedBy", "email name");

        // Collect user emails from found items
        foundItems.forEach((item) => {
          if (item.reportedBy && item.reportedBy.email) {
            userEmails.push(item.reportedBy.email);
            itemDetails.push({
              itemId: item._id,
              itemType: "found",
              itemName: item.itemName,
              userEmail: item.reportedBy.email,
              userName: item.reportedBy.name,
            });
          }
        });

        // Collect user emails from lost items
        lostItems.forEach((item) => {
          if (item.reportedBy && item.reportedBy.email) {
            userEmails.push(item.reportedBy.email);
            itemDetails.push({
              itemId: item._id,
              itemType: "lost",
              itemName: item.itemName,
              userEmail: item.reportedBy.email,
              userName: item.reportedBy.name,
            });
          }
        });
      } else {
        // If no item IDs, send to all users
        const users = await User.find({ role: { $ne: "admin" } }, "email name");
        userEmails = users.map((user) => user.email);
      }

      // Remove duplicates
      userEmails = [...new Set(userEmails)];

      if (userEmails.length === 0) {
        return {
          success: false,
          error: "No users found to send notifications",
        };
      }

      // Create email records in communication history
      const communicationRecords = [];

      // Send emails to each user
      const emailPromises = userEmails.map(async (email) => {
        try {
          // Find user details
          const user = await User.findOne({ email });
          const userName = user ? user.name : "User";

          // Personalize email with user's name
          const personalizedBody = body.replace("{userName}", userName);

          // Record in communication history
          const communicationRecord = new CommunicationHistory({
            userId: user ? user._id : null,
            userEmail: email,
            subject,
            body: personalizedBody,
            sentAt: new Date(),
            sentBy: adminId,
            messageType: "notification",
            relatedItems: itemDetails.filter(
              (item) => item.userEmail === email
            ),
          });

          communicationRecords.push(communicationRecord);

          // Send the actual email
          await sendEmail({
            to: email,
            subject,
            text: personalizedBody,
            html: `<div>${personalizedBody.replace(/\n/g, "<br>")}</div>`,
          });

          return { email, success: true };
        } catch (error) {
          console.error(`Error sending email to ${email}:`, error);
          return { email, success: false, error };
        }
      });

      // Wait for all emails to be sent
      const emailResults = await Promise.all(emailPromises);

      // Save all communication records
      await CommunicationHistory.insertMany(communicationRecords);

      // Count successful and failed emails
      const successCount = emailResults.filter((r) => r.success).length;
      const failedCount = emailResults.length - successCount;

      return {
        success: true,
        message: `Notification sent to ${successCount} users${
          failedCount > 0 ? ` (${failedCount} failed)` : ""
        }`,
        data: {
          totalRecipients: userEmails.length,
          successCount,
          failedCount,
        },
      };
    } catch (error: any) {
      console.error("Error sending notifications:", error);
      return {
        success: false,
        error: error.message || "Failed to send notifications",
      };
    }
  }

  /**
   * Get available email templates
   */
  async getEmailTemplates(): Promise<ApiResponse> {
    try {
      await dbConnect();

      const templates = await EmailTemplate.find().sort({ createdAt: -1 });

      return {
        success: true,
        data: templates,
      };
    } catch (error: any) {
      console.error("Error fetching email templates:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch email templates",
      };
    }
  }

  /**
   * Create a new email template
   */
  async createEmailTemplate(
    name: string,
    subject: string,
    body: string,
    type: string,
    createdBy?: string
  ): Promise<ApiResponse> {
    try {
      await dbConnect();

      // Check if template with same name exists
      const existingTemplate = await EmailTemplate.findOne({ name });
      if (existingTemplate) {
        return {
          success: false,
          error: "Email template with this name already exists",
        };
      }

      // Create new template
      const template = new EmailTemplate({
        name,
        subject,
        body,
        type,
        createdBy,
      });

      await template.save();

      return {
        success: true,
        message: "Email template created successfully",
        data: template,
      };
    } catch (error: any) {
      console.error("Error creating email template:", error);
      return {
        success: false,
        error: error.message || "Failed to create email template",
      };
    }
  }

  /**
   * Update an existing email template
   */
  async updateEmailTemplate(
    id: string,
    updates: {
      name?: string;
      subject?: string;
      body?: string;
      type?: string;
    },
    updatedBy?: string
  ): Promise<ApiResponse> {
    try {
      await dbConnect();

      // Find the template
      const template = await EmailTemplate.findById(id);
      if (!template) {
        return {
          success: false,
          error: "Email template not found",
        };
      }

      // If name is being updated, check if it's unique
      if (updates.name && updates.name !== template.name) {
        const existingTemplate = await EmailTemplate.findOne({
          name: updates.name,
          _id: { $ne: id },
        });
        if (existingTemplate) {
          return {
            success: false,
            error: "Email template with this name already exists",
          };
        }
      }

      // Update template fields
      if (updates.name) template.name = updates.name;
      if (updates.subject) template.subject = updates.subject;
      if (updates.body) template.body = updates.body;
      if (updates.type) template.type = updates.type;

      // Update metadata
      template.updatedAt = new Date();
      if (updatedBy) template.updatedBy = updatedBy;

      await template.save();

      return {
        success: true,
        message: "Email template updated successfully",
        data: template,
      };
    } catch (error: any) {
      console.error("Error updating email template:", error);
      return {
        success: false,
        error: error.message || "Failed to update email template",
      };
    }
  }

  /**
   * Delete an email template
   */
  async deleteEmailTemplate(id: string): Promise<ApiResponse> {
    try {
      await dbConnect();

      const result = await EmailTemplate.findByIdAndDelete(id);

      if (!result) {
        return {
          success: false,
          error: "Email template not found",
        };
      }

      return {
        success: true,
        message: "Email template deleted successfully",
      };
    } catch (error: any) {
      console.error("Error deleting email template:", error);
      return {
        success: false,
        error: error.message || "Failed to delete email template",
      };
    }
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();
