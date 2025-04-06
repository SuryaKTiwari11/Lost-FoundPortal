import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// More advanced middleware with custom callback
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Access session data from token
    // All session data is available on token since we added it in jwt callback
    const isVerified = token?.isVerified;
    const isAcceptingMessages = token?.isAcceptingMessages;
    const userId = token?._id;
    const username = token?.username;

    // Example of route-specific checks
    if (path.startsWith("/messages") && !isAcceptingMessages) {
      // Redirect users who aren't accepting messages away from message routes
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // For routes that require verification
    if ((path.startsWith("/create") || path.includes("/edit")) && !isVerified) {
      // Redirect unverified users trying to create/edit items
      return NextResponse.redirect(new URL("/profile/verify", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // First check if user is authenticated at all
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/sign-in",
    },
  }
);

// Apply middleware to these routes
export const config = {
  matcher: [
    // Protected routes pattern
    "/dashboard/:path*",
    "/profile/:path*",
    // Omitted public routes like homepage, sign in, etc.
  ],
};
