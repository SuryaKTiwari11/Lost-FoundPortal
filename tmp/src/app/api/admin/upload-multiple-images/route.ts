import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import FoundItem from "@/model/foundItem.model";
import type { ApiResponse } from "@/types";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Define allowed image extensions
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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

    // Ensure the request is multipart form data
    const formData = await request.formData();
    const itemId = formData.get("itemId") as string;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Extract all files from the form data
    const fileUrls: string[] = [];
    const errors: string[] = [];

    // Process each file in the form data
    for (const [key, value] of formData.entries()) {
      if (key !== "itemId" && value instanceof File) {
        const file = value as File;

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File size exceeds 5MB limit`);
          continue;
        }

        // Validate file type
        const fileExtension = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
          errors.push(
            `${file.name}: Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`
          );
          continue;
        }

        // Create a unique filename to prevent collisions
        const uniqueFilename = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(UPLOAD_DIR, uniqueFilename);
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Write the file to the upload directory
        fs.writeFileSync(filePath, fileBuffer);

        // Generate the URL for the uploaded file
        const fileUrl = `/uploads/${uniqueFilename}`;
        fileUrls.push(fileUrl);
      }
    }

    if (fileUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid files were uploaded",
          details: errors.length > 0 ? errors : undefined,
        },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Update the item with the new image URLs
    const foundItem = await FoundItem.findById(itemId);
    if (!foundItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Initialize images array if it doesn't exist
    if (!foundItem.images) {
      foundItem.images = [];
    }

    // Add all new images to the array
    foundItem.images = [...foundItem.images, ...fileUrls];

    // If there's no primary image set, use the first uploaded image
    if (!foundItem.imageURL && fileUrls.length > 0) {
      foundItem.imageURL = fileUrls[0];
    }

    await foundItem.save();

    // Record in verification history
    if (!foundItem.verificationHistory) {
      foundItem.verificationHistory = [];
    }

    foundItem.verificationHistory.push({
      timestamp: new Date(),
      action: "multipleImagesUploaded",
      performedBy: session.user.id,
      notes: `Uploaded ${fileUrls.length} images`,
    });

    await foundItem.save();

    return NextResponse.json({
      success: true,
      message: `${fileUrls.length} images uploaded successfully`,
      data: {
        uploadedImages: fileUrls,
        allImages: foundItem.images,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
