// ES Module for migrating data between MongoDB databases
import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current file directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
async function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");

  try {
    const envContent = fs.readFileSync(envPath, "utf8");
    const envLines = envContent.split("\n");

    envLines.forEach((line) => {
      // Skip comments and empty lines
      if (line.startsWith("#") || !line.trim()) return;

      // Parse key=value pairs
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";

        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }

        process.env[key] = value;
      }
    });

    console.log("✅ Loaded environment variables from .env file");
  } catch (error) {
    console.error("Error loading .env file:", error.message);
    process.exit(1);
  }
}

// Configuration - Can be set via environment variables
async function getConfig() {
  // Source is local MongoDB by default
  const SOURCE_URI =
    process.env.SOURCE_MONGODB_URI || "mongodb://localhost:27017/lostnfound";

  // Target is the MONGODB_URI from .env by default
  const TARGET_URI = process.env.TARGET_MONGODB_URI || process.env.MONGODB_URI;

  if (!TARGET_URI) {
    console.error(
      "❌ No target MongoDB URI found. Please set MONGODB_URI or TARGET_MONGODB_URI in your .env file."
    );
    process.exit(1);
  }

  return { SOURCE_URI, TARGET_URI };
}

// Migration function
async function migrateData() {
  console.log("🚀 Starting database migration (ES Module version)...");

  // Load environment variables
  await loadEnv();

  // Get configuration
  const { SOURCE_URI, TARGET_URI } = await getConfig();

  console.log(`- Source: ${SOURCE_URI.replace(/:[^:]*@/, ":****@")}`);
  console.log(`- Target: ${TARGET_URI.replace(/:[^:]*@/, ":****@")}`);

  // Connect to both databases
  let sourceClient, targetClient;

  try {
    console.log("\nConnecting to databases...");

    sourceClient = new MongoClient(SOURCE_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      connectTimeoutMS: 10000, // 10 seconds
    });

    targetClient = new MongoClient(TARGET_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      connectTimeoutMS: 10000, // 10 seconds
    });

    await Promise.all([sourceClient.connect(), targetClient.connect()]);

    console.log("✅ Connected to both databases");

    const sourceDb = sourceClient.db();
    const targetDb = targetClient.db();

    // Get collections from source database
    const collections = await sourceDb.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    console.log(
      `\nFound ${collectionNames.length} collections in source database:`
    );
    console.log(collectionNames.join(", "));

    // Migrate each collection
    for (const collectionName of collectionNames) {
      // Skip system collections
      if (collectionName.startsWith("system.")) {
        console.log(`\nSkipping system collection: ${collectionName}`);
        continue;
      }

      console.log(`\n📦 Migrating collection: ${collectionName}...`);

      try {
        // Get data from source collection
        const sourceCollection = sourceDb.collection(collectionName);
        const documents = await sourceCollection.find({}).toArray();

        if (documents.length === 0) {
          console.log(`  - Collection ${collectionName} is empty, skipping`);
          continue;
        }

        console.log(`  - Found ${documents.length} documents`);

        // Insert into target collection (drop existing first)
        const targetCollection = targetDb.collection(collectionName);

        // Drop the existing collection in target if it exists
        try {
          await targetCollection.drop();
          console.log(`  - Dropped existing collection in target database`);
        } catch (err) {
          // Collection might not exist, that's fine
          console.log(`  - No existing collection found in target database`);
        }

        // Insert documents in batches to avoid large payloads
        const batchSize = 100;
        let inserted = 0;

        for (let i = 0; i < documents.length; i += batchSize) {
          const batch = documents.slice(
            i,
            Math.min(i + batchSize, documents.length)
          );
          await targetCollection.insertMany(batch);
          inserted += batch.length;
          console.log(
            `  - Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)} (${inserted}/${documents.length})`
          );
        }

        console.log(`✅ Completed migration for collection: ${collectionName}`);
      } catch (error) {
        console.error(
          `❌ Error migrating collection ${collectionName}:`,
          error
        );
      }
    }

    console.log("\n✅ Migration completed successfully!");

    // Show stats of target database
    try {
      const stats = await targetDb.stats();
      console.log("\nTarget database statistics:");
      console.log(`- Collections: ${stats.collections}`);
      console.log(`- Documents: ${stats.objects}`);
      console.log(
        `- Storage size: ${Math.round((stats.storageSize / 1024 / 1024) * 100) / 100} MB`
      );
    } catch (error) {
      console.error("Error getting target database statistics:", error);
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
  } finally {
    // Close connections
    if (sourceClient) {
      await sourceClient.close();
      console.log("\nSource database connection closed");
    }
    if (targetClient) {
      await targetClient.close();
      console.log("Target database connection closed");
    }
  }
}

// Run the migration
migrateData().catch(console.error);
