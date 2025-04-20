import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/services/auth/auth.service";

// Type definitions for next-auth
import "./auth-types";

// Check environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.warn(
    "WARNING: NEXTAUTH_SECRET is not set. Using fallback secret. This is not secure for production!"
  );
} else {
  console.log("NEXTAUTH_SECRET is configured correctly");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          throw new Error("Email and password are required");
        }

        // Use the auth service to handle authentication
        try {
          const result = await authService.authenticateUser(
            credentials.email,
            credentials.password
          );

          return result;
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      console.log("Sign-in attempt with profile:", profile?.email);
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // When sign in, add user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        console.log("JWT callback: Adding user data to token", {
          id: user.id,
          role: user.role,
        });
      }

      // Ensure role is always present in token
      if (!token.role) {
        token.role = "user";
      }

      console.log("JWT callback returning token with role:", token.role);
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role as string;
        console.log("Session callback: User role set to", session.user.role);
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign",
    error: "/auth-error",
  },
  logger: {
    error(code, ...message) {
      console.error(code, message);
    },
    warn(code, ...message) {
      console.warn(code, message);
    },
    debug(code, ...message) {
      console.debug(code, message);
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

export default authOptions;
