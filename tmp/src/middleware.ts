import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Function to handle API routes
function handleApiRoutes(request: NextRequest) {
  // Add debugging headers and logging for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-api-middleware", "true");

  console.log(`API Request: ${request.method} ${request.nextUrl.pathname}`);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// More advanced middleware with custom callback
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If this is an API route, use the API handler
    if (path.startsWith("/api/")) {
      return handleApiRoutes(req);
    }

    // Debug token information (this will appear in server logs)
    console.log(`Middleware processing path: ${path}`);
    console.log(`Token details:`, {
      exists: !!token,
      role: token?.role || "none",
      email: token?.email || "none",
      name: token?.name || "none",
    });

    // For admin routes, check if user has admin role
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        console.log("Non-admin access blocked - redirecting to home");
        return NextResponse.redirect(new URL("/", req.url));
      }
      console.log("Admin access granted to:", token?.email);
    }

    // For other protected routes, any authenticated user can access
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Allow access to public routes without authentication
        if (
          path === "/" ||
          path === "/sign" ||
          path.startsWith("/sign") ||
          path === "/auth-error" ||
          path.startsWith("/auth") ||
          path.startsWith("/about") ||
          path.startsWith("/api") ||
          path.startsWith("/all-items") ||
          path.startsWith("/found-items") ||
          path.startsWith("/lost-items")
        ) {
          return true;
        }

        // For admin routes, verify admin role is present
        if (path.startsWith("/admin")) {
          const hasAdminRole = !!token && token.role === "admin";
          console.log(
            `Admin authorization check: ${hasAdminRole ? "GRANTED" : "DENIED"}`
          );
          return hasAdminRole;
        }

        // All other protected routes require any valid token
        return !!token;
      },
    },
    pages: {
      signIn: "/sign",
      error: "/auth-error",
    },
  }
);

// Apply middleware to these routes (be specific to avoid over-protection)
export const config = {
  matcher: [
    // API routes
    "/api/:path*",
    // Protected routes pattern
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/report-found/:path*",
    "/report-lost/:path*",
  ],
};
