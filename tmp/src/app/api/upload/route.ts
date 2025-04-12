import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

// Check for Cloudinary configuration at runtime
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error(
    "CRITICAL ERROR: Missing Cloudinary configuration - image uploads will fail!"
  );
}

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only images are allowed" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString("base64");
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Generate a unique public_id for the image
    const uniqueId = uuidv4().substring(0, 8);
    const fileName = file.name.split(".")[0];
    const safeFileName = fileName.replace(/[^a-zA-Z0-9]/g, "_");
    const publicId = `lost-found/${safeFileName}_${uniqueId}`;

    console.log("Starting image upload to Cloudinary...");
    console.log(
      `Using Cloudinary cloud name: ${process.env.CLOUDINARY_CLOUD_NAME}`
    );

    try {
      // Use direct upload approach with shorter timeout
      const result = await new Promise((resolve, reject) => {
        const uploadTimeout = setTimeout(() => {
          reject(new Error("Upload timed out after 30 seconds"));
        }, 30000);

        cloudinary.uploader.upload(
          dataURI,
          {
            public_id: publicId,
            folder: "lost-found",
            resource_type: "auto",
            timeout: 60000, // 60 seconds timeout
          },
          (error, result) => {
            clearTimeout(uploadTimeout);
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
      });

      console.log("Upload successful:", (result as any).secure_url);

      return NextResponse.json({
        success: true,
        url: (result as any).secure_url,
        public_id: (result as any).public_id,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Image upload failed. Please try again.",
          details:
            error instanceof Error ? error.message : "Unknown upload error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      { success: false, error: "Server error processing upload request" },
      { status: 500 }
    );
  }
}
