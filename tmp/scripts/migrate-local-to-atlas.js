// Script to migrate data from local MongoDB to MongoDB Atlas
require("dotenv").config();
const { MongoClient } = require("mongodb");

// Configuration
const LOCAL_URI = "mongodb://localhost:27017/lostnfound"; // Update with your local DB name
const ATLAS_URI = process.env.MONGODB_URI; // Your Atlas URI from .env

if (!ATLAS_URI) {
  console.error("❌ MONGODB_URI not found in .env file");
  console.error("Please set your MongoDB Atlas URI in the .env file");
  process.exit(1);
}

async function migrateData() {
  console.log("Starting database migration...");
  console.log(`From: Local MongoDB`);
  console.log(`To: MongoDB Atlas`);

  // Connect to both databases
  let localClient, atlasClient;

  try {
    console.log("Connecting to databases...");
    localClient = await MongoClient.connect(LOCAL_URI);
    atlasClient = await MongoClient.connect(ATLAS_URI);

    const localDb = localClient.db();
    const atlasDb = atlasClient.db();

    console.log("✅ Connected to both databases");

    // Get list of collections from local DB
    const collections = await localDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to migrate`);

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;

      // Skip system collections
      if (collectionName.startsWith("system.")) {
        console.log(`Skipping system collection: ${collectionName}`);
        continue;
      }

      console.log(`Migrating collection: ${collectionName}...`);

      // Get data from local collection
      const localCollection = localDb.collection(collectionName);
      const documents = await localCollection.find({}).toArray();

      if (documents.length === 0) {
        console.log(`  - Collection ${collectionName} is empty, skipping`);
        continue;
      }

      console.log(`  - Found ${documents.length} documents`);

      // Insert into Atlas collection (drop existing first to avoid duplicates)
      const atlasCollection = atlasDb.collection(collectionName);
      try {
        await atlasCollection.drop();
        console.log(`  - Dropped existing collection in Atlas`);
      } catch (err) {
        // Collection might not exist, that's fine
      }

      // Insert documents in batches of 100
      const batchSize = 100;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        await atlasCollection.insertMany(batch);
        console.log(
          `  - Inserted batch ${i / batchSize + 1}/${Math.ceil(documents.length / batchSize)}`
        );
      }

      console.log(`✅ Migrated collection: ${collectionName}`);
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Update your .env file to use only the MONGODB_URI");
    console.log("2. Restart your application to use the new database");
    console.log("3. Make sure everything works as expected");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    // Close connections
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
    console.log("Database connections closed");
  }
}

migrateData().catch(console.error);
