import { NextRequest, NextResponse } from "next/server";

// Simple in-memory store for rate limiting
// Note: For production with multiple servers, you'd want to use Redis or another shared store
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  limit?: number; // Maximum number of requests within window
  windowMs?: number; // Time window in milliseconds
  message?: string; // Custom error message
}

/**
 * Rate limiting middleware for Next.js API routes
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  const {
    limit = 60,
    windowMs = 60 * 1000, // 1 minute by default
    message = "Too many requests, please try again later.",
  } = options;

  return async (req: NextRequest) => {
    // Get client IP address
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";

    // Get current timestamp
    const now = Date.now();

    // Get or initialize request count data for this IP
    const requestData = ipRequestCounts.get(ip) || {
      count: 0,
      resetTime: now + windowMs,
    };

    // Reset count if the window has expired
    if (now > requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + windowMs;
    }

    // Increment request count
    requestData.count += 1;
    ipRequestCounts.set(ip, requestData);

    // Check if limit is exceeded
    if (requestData.count > limit) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);

      // Return rate limit error response
      return NextResponse.json(
        { success: false, error: message },
        {
          status: 429, // Too Many Requests
          headers: {
            "Retry-After": `${Math.ceil((requestData.resetTime - now) / 1000)}`,
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(
              requestData.resetTime / 1000
            ).toString(),
          },
        }
      );
    }

    // Add rate limit headers to the response
    const response = await handler(req);

    // Create a new response with the rate limit headers
    const remainingRequests = Math.max(0, limit - requestData.count);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-RateLimit-Limit", limit.toString());
    newHeaders.set("X-RateLimit-Remaining", remainingRequests.toString());
    newHeaders.set(
      "X-RateLimit-Reset",
      Math.ceil(requestData.resetTime / 1000).toString()
    );

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

/**
 * Higher-order function that combines rate limiting and validation
 */
export function withProtection<T>(
  handler: (req: NextRequest, data?: T) => Promise<NextResponse>,
  options: {
    rateLimit?: RateLimitOptions;
    validate?: (
      req: NextRequest
    ) => Promise<{ success: boolean; data?: T; error?: string }>;
  } = {}
) {
  const { rateLimit, validate } = options;

  const rateLimitedHandler = rateLimit
    ? withRateLimit(handler, rateLimit)
    : handler;

  // If no validation function is provided, just return the rate-limited handler
  if (!validate) {
    return rateLimitedHandler;
  }

  // Return a handler with both rate limiting and validation
  return async (req: NextRequest) => {
    // Perform validation
    const validationResult = await validate(req);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      );
    }

    // Pass validated data to the handler
    const wrappedHandler = (req: NextRequest) =>
      handler(req, validationResult.data);

    // Apply rate limiting to the wrapped handler
    return rateLimit
      ? withRateLimit(wrappedHandler, rateLimit)(req)
      : wrappedHandler(req);
  };
}
