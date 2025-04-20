import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import type { ApiResponse } from "@/types";

// Define allowed file types and size limits
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
if (typeof window === "undefined" && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Upload Service
 * Handles file upload operations
 */
export const uploadService = {
  /**
   * Upload a file to the server
   */
  async uploadFile(file: File): Promise<ApiResponse> {
    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        };
      }

      // Validate file type
      const fileExtension = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        return {
          success: false,
          error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
        };
      }

      // Create a unique filename to prevent collisions
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(UPLOAD_DIR, uniqueFilename);

      // Convert file to buffer
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Write the file to disk
      fs.writeFileSync(filePath, fileBuffer);

      // Generate URL for the uploaded file
      const fileUrl = `/uploads/${uniqueFilename}`;

      return {
        success: true,
        data: {
          fileName: uniqueFilename,
          originalName: file.name,
          fileUrl,
          fileSize: file.size,
          fileType: file.type,
        },
      };
    } catch (error) {
      console.error("Error in uploadService.uploadFile:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during file upload",
      };
    }
  },

  /**
   * Delete a file from the server
   */
  async deleteFile(fileName: string): Promise<ApiResponse> {
    try {
      const filePath = path.join(UPLOAD_DIR, fileName);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: "File not found",
        };
      }

      // Delete the file
      fs.unlinkSync(filePath);

      return {
        success: true,
        message: "File deleted successfully",
      };
    } catch (error) {
      console.error("Error in uploadService.deleteFile:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during file deletion",
      };
    }
  },
};
