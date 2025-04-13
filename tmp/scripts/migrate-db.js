// Simple script to migrate data between MongoDB databases
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

// Configuration - you can update these directly here
const SOURCE_URI = "mongodb://localhost:27017/lostnfound";
const TARGET_URI = process.argv[2] || process.env.TARGET_MONGODB_URI;

// Collection names to migrate
const COLLECTIONS = [
    "users",
    "lostitems",
    "founditems",
    "itemmatches",
    "claimrequests",
    "foundreports",
];

// Connect to a MongoDB URI
async function connectToDatabase(uri) {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log(`✅ Connected to database: ${uri}`);
        return client;
    } catch (error) {
        console.error(`❌ Failed to connect to database: ${uri}`, error);
        throw error;
    }
}

// Migrate a single collection
async function migrateCollection(sourceDb, targetDb, collectionName) {
    try {
        console.log(`\n📦 Migrating collection: ${collectionName}...`);

        const sourceCollection = sourceDb.collection(collectionName);
        const documents = await sourceCollection.find({}).toArray();

        if (documents.length === 0) {
            console.log(`  - Collection ${collectionName} is empty, skipping`);
            return;
        }

        console.log(`  - Found ${documents.length} documents`);

        const targetCollection = targetDb.collection(collectionName);

        // Drop the existing collection in target if it exists
        try {
            await targetCollection.drop();
            console.log(`  - Dropped existing collection in target database`);
        } catch (err) {
            console.log(`  - No existing collection found in target database`);
        }

        // Insert documents
        await targetCollection.insertMany(documents);
        console.log(
            `✅ Inserted ${documents.length} documents into ${collectionName}`
        );
    } catch (error) {
        console.error(`❌ Error migrating collection ${collectionName}:`, error);
    }
}

// Migrate all collections
async function migrateData() {
    console.log("🚀 Starting database migration...");
    console.log(`- Source: Local MongoDB`);
    console.log(`- Target: MongoDB Atlas`);

    if (!TARGET_URI) {
        console.error("\n❌ No target MongoDB URI provided.");
        console.error(
            "Please provide a target MongoDB URI as an argument or set TARGET_MONGODB_URI in .env"
        );
        console.error(
            'Example: node scripts/migrate-db.js "mongodb+srv://user:pass@cluster.mongodb.net/lostnfound"'
        );
        process.exit(1);
    }

    let sourceClient, targetClient;

    try {
        console.log("\nConnecting to databases...");
        sourceClient = await connectToDatabase(SOURCE_URI);
        targetClient = await connectToDatabase(TARGET_URI);

        const sourceDb = sourceClient.db();
        const targetDb = targetClient.db();

        const sourceCollections = await sourceDb.listCollections().toArray();
        const collectionNames = sourceCollections.map((c) => c.name);

        console.log(
            `\nFound ${collectionNames.length} collections in source database:`
        );
        console.log(collectionNames.join(", "));

        for (const collectionName of collectionNames) {
            if (collectionName.startsWith("system.")) {
                console.log(`\nSkipping system collection: ${collectionName}`);
                continue;
            }

            await migrateCollection(sourceDb, targetDb, collectionName);
        }

        console.log("\n✅ Migration completed!");

        const stats = await targetDb.stats();
        console.log("\nTarget database statistics:");
        console.log(`- Collections: ${stats.collections}`);
        console.log(`- Documents: ${stats.objects}`);
        console.log(
            `- Storage size: ${Math.round((stats.storageSize / 1024 / 1024) * 100) / 100} MB`
        );
    } catch (error) {
        console.error("\n❌ Migration failed:", error);
    } finally {
        if (sourceClient) await sourceClient.close();
        if (targetClient) await targetClient.close();
        console.log("\nDatabase connections closed");
    }
}

migrateData().catch(console.error);
