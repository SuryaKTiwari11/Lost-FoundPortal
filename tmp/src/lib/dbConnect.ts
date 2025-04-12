import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/lostnfound";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintaining up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log(
      `Connecting to MongoDB at ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`
    );
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ Connected to MongoDB successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ Error connecting to MongoDB:", e);
    throw e;
  }

  return cached.conn;
}

/**
 * Simple function to connect to the database
 * Use this in API routes and server components
 */
async function connectToDatabase() {
  try {
    await dbConnect();
    return { success: true };
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return { success: false, error };
  }
}

// Export both as named exports
export { dbConnect, connectToDatabase };

// Also export dbConnect as the default export to maintain compatibility
export default dbConnect;
