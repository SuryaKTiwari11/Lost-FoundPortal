import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// More advanced middleware with custom callback
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

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
    // Protected routes pattern
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/report-found/:path*",
    "/report-lost/:path*",
  ],
};
