import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
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
  ],
  callbacks: {
    async signIn({ account, profile }) {
      console.log("Sign-in attempt with profile:", profile?.email);

      // Accept all Google sign-ins for now for debugging
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }

      // If Google sign-in, create or update user in database
      if (account?.provider === "google" && token.email) {
        try {
          await dbConnect();

          // Find or create user in database
          const user = await User.findOneAndUpdate(
            { email: token.email },
            {
              $setOnInsert: {
                name: token.name || "User",
                email: token.email,
                image: token.picture || "",
                createdAt: new Date(),
              },
              $set: {
                // Update these fields even if user exists
                lastLogin: new Date(),
              },
            },
            {
              upsert: true, // Create if doesn't exist
              new: true, // Return the updated document
            }
          );

          // Add user data to token
          token.id = user._id.toString();
          token.role = user.role || "user";
        } catch (error) {
          console.error("Error with user in database:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign",
    error: "/auth-error", // Use our custom error page
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
  debug: true, // Always enable debug for troubleshooting
  secret:
    process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production",
};

export default authOptions;
