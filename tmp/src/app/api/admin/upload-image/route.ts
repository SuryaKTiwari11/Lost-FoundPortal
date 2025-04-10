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
    const file = formData.get("file") as File;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create a unique filename to prevent collisions
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Write the file to the upload directory
    fs.writeFileSync(filePath, fileBuffer);

    // Generate the URL for the uploaded file
    const fileUrl = `/uploads/${uniqueFilename}`;

    // Connect to the database
    await dbConnect();

    // Update the item with the new image URL
    const foundItem = await FoundItem.findById(itemId);
    if (!foundItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Add the new image URL to the images array
    if (!foundItem.images) {
      foundItem.images = [];
    }

    foundItem.images.push(fileUrl);

    // If this is the first image and there's no imageURL set, set it as the primary
    if (!foundItem.imageURL) {
      foundItem.imageURL = fileUrl;
    }

    await foundItem.save();

    // Record in verification history
    if (!foundItem.verificationHistory) {
      foundItem.verificationHistory = [];
    }

    foundItem.verificationHistory.push({
      timestamp: new Date(),
      action: "imageUploaded",
      performedBy: session.user.id,
      notes: `Image uploaded: ${file.name}`,
    });

    await foundItem.save();

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl: fileUrl,
        allImages: foundItem.images,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}
