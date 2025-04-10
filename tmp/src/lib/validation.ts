import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Validate request data using Zod schema
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.Schema<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    // Parse the JSON body from the request
    const body = await request.json();

    // Validate the body against the schema
    const validData = schema.parse(body);

    return { success: true, data: validData };
  } catch (error) {
    console.error("Validation error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      return {
        success: false,
        error: `Validation failed: ${errorMessages.join(", ")}`,
      };
    }

    // Handle other errors
    return {
      success: false,
      error: "Failed to validate request data",
    };
  }
}

/**
 * API handler wrapper with validation
 */
export function withValidation<T>(
  schema: z.Schema<T>,
  handler: (req: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    // Validate the request data
    const result = await validateRequest(request, schema);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Call the handler with the validated data
    return handler(request, result.data!);
  };
}
