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

// Check if NEXTAUTH_SECRET is properly set
if (!process.env.NEXTAUTH_SECRET) {
  console.warn(
    "WARNING: NEXTAUTH_SECRET is not set. Using fallback secret. This is not secure for production!"
  );
} else {
  console.log("NEXTAUTH_SECRET is configured correctly");
}

// Validate admin credentials are available
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.error(
    "ERROR: Admin credentials are not properly configured in environment variables!"
  );
} else {
  console.log(
    "Admin credentials are configured correctly:",
    process.env.ADMIN_EMAIL
  );
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
          if (!credentials || !credentials.email || !credentials.password) {
            console.log("Missing credentials");
            throw new Error("Email and password are required");
          }

          const { email, password } = credentials;

          // Special handling for admin login
          if (email === process.env.ADMIN_EMAIL) {
            console.log("Admin login attempt detected");

            // Fetch admin password from environment variables
            const adminPassword = process.env.ADMIN_PASSWORD;
            if (!adminPassword) {
              console.error(
                "Admin password is not set in environment variables"
              );
              throw new Error("Admin credentials are not configured");
            }

            if (password === adminPassword) {
              console.log("Admin password matches - login successful");

              try {
                await dbConnect();
                const adminUser = await User.findOne({ email });

                if (!adminUser) {
                  console.log(
                    "Admin user doesn't exist, creating new admin account"
                  );
                  const hashedPassword = await bcrypt.hash(adminPassword, 10);
                  const newAdminUser = await User.create({
                    email: process.env.ADMIN_EMAIL,
                    password: hashedPassword,
                    name: "Admin User",
                    role: "admin",
                    isVerified: true,
                  });
                  console.log("Admin created with ID:", newAdminUser._id);
                  return {
                    id: newAdminUser._id.toString(),
                    name: "Admin User",
                    email: process.env.ADMIN_EMAIL,
                    role: "admin",
                  };
                }

                console.log("Admin user exists, login successful");
                return {
                  id: adminUser._id.toString(),
                  name: adminUser.name || "Admin User",
                  email: adminUser.email,
                  role: "admin",
                };
              } catch (error) {
                console.error(
                  "Error during admin user lookup/creation:",
                  error
                );
                throw new Error("Admin login failed due to server error");
              }
            }

            console.log("Admin password doesn't match");
            throw new Error("Invalid admin credentials");
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

      // Google sign-in case
      if (account?.provider === "google" && token.email) {
        // ...existing code...
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
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - refresh token more frequently
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
