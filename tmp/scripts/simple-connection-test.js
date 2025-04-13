// Simple script to test MongoDB Atlas connection
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables
dotenv.config();

// Get the URI from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI environment variable not found!");
  console.error(
    "Please make sure your .env file contains a MONGODB_URI variable."
  );
  process.exit(1);
}

// Display URI (with hidden password)
console.log("Testing connection to:", uri.replace(/:[^:]*@/, ":****@"));

async function testConnection() {
  const client = new MongoClient(uri);

  try {
    console.log("Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("✅ Connection successful!");

    // Get database info
    const db = client.db();
    const stats = await db.stats();

    console.log(`\nDatabase: ${db.databaseName}`);
    console.log(`Collections: ${stats.collections}`);
    console.log(`Documents: ${stats.objects}`);

    // List collections
    const collections = await db.listCollections().toArray();

    if (collections.length > 0) {
      console.log("\nCollections:");
      collections.forEach((collection) => {
        console.log(`- ${collection.name}`);
      });
    } else {
      console.log("\nNo collections found. Your database is empty.");
    }

    return true;
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);
    return false;
  } finally {
    console.log("\nClosing connection...");
    await client.close();
  }
}

// Run the test
testConnection()
  .then((success) => {
    if (success) {
      console.log("\n✅ Your connection to MongoDB Atlas is working properly!");
      console.log("You can now use this connection in your application.");
    } else {
      console.log("\n❌ Connection test failed.");
      console.log("Please check your connection string and network settings.");
    }
  })
  .catch((err) => {
    console.error("Unexpected error:", err);
  });
