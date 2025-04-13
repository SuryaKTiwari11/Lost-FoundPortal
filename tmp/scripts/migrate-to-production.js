/**
 * Migration script to transfer data from local MongoDB to production
 *
 * Usage:
 * 1. Set SOURCE_MONGODB_URI to your local MongoDB URI
 * 2. Set TARGET_MONGODB_URI to your production MongoDB URI
 * 3. Run with: node scripts/migrate-to-production.js
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.production
dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

// Configuration
const SOURCE_MONGODB_URI = "mongodb://localhost:27017/lostnfound";
const TARGET_MONGODB_URI = process.env.MONGODB_URI;

// Collections to migrate
const COLLECTIONS = [
  "users",
  "lostitems",
  "founditems",
  "claimrequests",
  "communicationhistories",
  "emailtemplates",
  "itemmatches",
];

// Connect to both source and target databases
async function connectToDatabases() {
  console.log("Connecting to source and target databases...");

  // Connect to source (local) database
  const sourceConnection = await mongoose.createConnection(SOURCE_MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Connect to target (production) database
  const targetConnection = await mongoose.createConnection(TARGET_MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("✅ Connected to both databases!");
  return { sourceConnection, targetConnection };
}

// Migrate a single collection
async function migrateCollection(
  sourceConnection,
  targetConnection,
  collectionName
) {
  console.log(`\nMigrating collection: ${collectionName}`);

  // Get handles to source and target collections
  const sourceCollection = sourceConnection.collection(collectionName);
  const targetCollection = targetConnection.collection(collectionName);

  // Get count of documents in source collection
  const count = await sourceCollection.countDocuments();
  console.log(`Found ${count} documents in source ${collectionName}`);

  if (count === 0) {
    console.log(`No documents to migrate for ${collectionName}`);
    return 0;
  }

  // Fetch all documents from source
  const documents = await sourceCollection.find({}).toArray();

  // Check if target collection already has documents
  const targetCount = await targetCollection.countDocuments();
  if (targetCount > 0) {
    console.log(
      `Warning: Target ${collectionName} already has ${targetCount} documents`
    );
    const proceed = await promptUser(
      `Do you want to proceed with migration? This might create duplicates. (y/n): `
    );
    if (proceed.toLowerCase() !== "y") {
      console.log(`Skipping ${collectionName} migration`);
      return 0;
    }
  }

  // Insert documents into target
  const result = await targetCollection.insertMany(documents, {
    ordered: false,
  });
  console.log(
    `✅ Successfully migrated ${result.insertedCount} documents to ${collectionName}`
  );
  return result.insertedCount;
}

// Simple utility to prompt user for input
async function promptUser(question) {
  const readline = (await import("readline")).default.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

// Main migration function
async function migrateData() {
  console.log("Starting migration from local to production MongoDB...");

  try {
    // Connect to both databases
    const { sourceConnection, targetConnection } = await connectToDatabases();

    // Verify production connection string before proceeding
    console.log(
      `Target MongoDB URI: ${TARGET_MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`
    );
    const proceed = await promptUser(
      "Is this the correct production MongoDB URI? (y/n): "
    );

    if (proceed.toLowerCase() !== "y") {
      console.log("Migration aborted by user");
      process.exit(0);
    }

    // Stats tracking
    const stats = {
      totalDocuments: 0,
      migratedCollections: 0,
      failedCollections: [],
    };

    // Migrate each collection
    for (const collection of COLLECTIONS) {
      try {
        const migratedCount = await migrateCollection(
          sourceConnection,
          targetConnection,
          collection
        );
        stats.totalDocuments += migratedCount;
        stats.migratedCollections++;
      } catch (error) {
        console.error(`❌ Error migrating ${collection}: ${error.message}`);
        stats.failedCollections.push(collection);
      }
    }

    // Display migration summary
    console.log("\n===== Migration Summary =====");
    console.log(`Total documents migrated: ${stats.totalDocuments}`);
    console.log(
      `Collections successfully migrated: ${stats.migratedCollections}/${COLLECTIONS.length}`
    );

    if (stats.failedCollections.length > 0) {
      console.log(`Failed collections: ${stats.failedCollections.join(", ")}`);
    }

    // Close connections
    await sourceConnection.close();
    await targetConnection.close();
    console.log("Database connections closed");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

// Run the migration
migrateData().catch(console.error);
