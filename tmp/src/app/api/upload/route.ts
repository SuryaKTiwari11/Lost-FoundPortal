import { NextResponse } from "next/server";
import { uploadService } from "@/services/upload/upload.service";

/**
 * POST handler for uploading files
 */
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

    // Call the upload service to handle the file upload
    const result = await uploadService.uploadFile(file);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      { success: false, error: "Server error processing upload request" },
      { status: 500 }
    );
  }
}
