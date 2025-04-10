import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

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

// Direct MongoDB connection for credentials auth
async function directMongoAuth(email: string, password: string) {
  try {
    // Use the same MongoDB URI as your application
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/lost-found-portal";

    // Extract just the base URI without database name and parameters
    const baseUri = uri.split("?")[0].split("/").slice(0, 3).join("/");
    const dbName = uri.split("/").pop()?.split("?")[0] || "lost-found-portal";

    console.log(
      `Attempting direct MongoDB connection to ${baseUri} for database ${dbName}`
    );

    // Connect directly to MongoDB
    const client = new MongoClient(uri);
    await client.connect();

    // Select database and collection
    const db = client.db(dbName);
    const users = db.collection("users");

    // Find user by email
    const user = await users.findOne({ email });

    // Close connection
    await client.close();

    // If no user found
    if (!user) {
      console.log(
        `No user found with email: ${email} via direct MongoDB connection`
      );
      return null;
    }

    // If user has no password
    if (!user.password) {
      console.log(`User ${email} has no password set`);
      return null;
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log(`Invalid password for user: ${email}`);
      return null;
    }

    console.log(`User ${email} authenticated successfully via direct MongoDB!`);

    // Return user data
    return {
      id: user._id.toString(),
      name: user.name || "User",
      email: user.email,
      role: user.role || "user",
      image: user.image || "",
    };
  } catch (error) {
    console.error("Direct MongoDB auth error:", error);
    return null;
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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Make sure credentials are provided
          if (!credentials || !credentials.email || !credentials.password) {
            console.log("Missing credentials");
            throw new Error("Email and password are required");
          }

          const { email, password } = credentials;

          // Special handling for admin login
          if (email === "admin@lostfound.com") {
            console.log(
              "Admin login attempt detected, using direct MongoDB auth"
            );
            const user = await directMongoAuth(email, password);

            if (user) {
              return user;
            } else {
              throw new Error("Invalid admin credentials");
            }
          }

          // Regular authentication using Mongoose for non-admin users
          await dbConnect();

          // Find user by email
          const user = await User.findOne({ email });

          if (!user) {
            console.log(`No user found with email: ${email}`);
            throw new Error("Invalid email or password");
          }

          // Fallback to direct MongoDB auth if Mongoose model has issues
          if (!user.password) {
            console.log(
              "User found but no password in Mongoose model, trying direct MongoDB"
            );
            const directUser = await directMongoAuth(email, password);

            if (directUser) {
              return directUser;
            } else {
              throw new Error("Invalid email or password");
            }
          }

          // Compare password with Mongoose model
          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            console.log(`Invalid password for user: ${email}`);
            throw new Error("Invalid email or password");
          }

          console.log(
            `User ${email} authenticated successfully with Mongoose!`
          );

          return {
            id: user._id.toString(),
            name: user.name || "User",
            email: user.email,
            role: user.role || "user",
            image: user.image || "",
          };
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

      // Allow all email domains - removed any Thapar-only restriction
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
