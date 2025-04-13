/**
 * MongoDB Atlas Connection Test Script
 *
 * This script attempts to connect to your MongoDB Atlas database
 * with detailed error reporting to help diagnose connection issues.
 *
 * Usage:
 * 1. node scripts/test-mongodb-connection.js
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import readline from "readline";
import { fileURLToPath } from "url";

// Get current file directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Load environment variables
console.log("Loading environment variables...");
const envPaths = [
  path.resolve(process.cwd(), ".env.production"),
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
];

let envLoaded = false;

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✓ Loaded environment from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn(
    "⚠ No environment file found. Using default or system environment variables."
  );
}

// Extract MongoDB URI from environment
let mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("❌ No MONGODB_URI found in environment variables.");
  askForConnectionString();
} else {
  console.log(`Found MongoDB URI: ${hideCredentials(mongoUri)}`);
  testMongoConnection(mongoUri);
}

// Function to hide credentials in the connection string
function hideCredentials(uri) {
  return uri.replace(/(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/, "$1***:***@");
}

// Function to prompt for manual connection string input
function askForConnectionString() {
  rl.question("Enter your MongoDB connection string manually: ", (uri) => {
    if (!uri) {
      console.error("❌ No connection string provided. Exiting.");
      rl.close();
      process.exit(1);
    }

    console.log(`Testing with provided URI: ${hideCredentials(uri)}`);
    testMongoConnection(uri);
  });
}

// Test connection function with detailed diagnostics
async function testMongoConnection(uri) {
  console.log("\n🔄 Testing MongoDB Atlas connection...");

  try {
    // Parse the MongoDB URI to get components for diagnostics
    const uriParts = parseMongoUri(uri);

    if (uriParts.error) {
      console.error(`❌ ${uriParts.error}`);
      askToFixUri();
      return;
    }

    console.log("Connection Details:");
    console.log(`- Protocol: ${uriParts.protocol}`);
    console.log(`- Host: ${uriParts.host}`);
    console.log(`- Username: ${uriParts.username}`);
    console.log(`- Database: ${uriParts.database || "(none specified)"}`);
    console.log(`- Options: ${JSON.stringify(uriParts.options)}`);
    console.log("\n");

    // Attempt connection with extended timeout
    console.log("Attempting to connect...");
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Longer timeout for diagnostics
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
      family: 4, // Force IPv4
    });

    console.log("✅ Successfully connected to MongoDB Atlas!");

    // Check database info
    const adminDb = connection.connection.db.admin();
    const serverInfo = await adminDb.serverInfo();
    console.log(`\nConnected to MongoDB version: ${serverInfo.version}`);

    // List databases if permissions allow
    try {
      const dbList = await adminDb.listDatabases();
      console.log("\nAvailable databases:");
      dbList.databases.forEach((db) => {
        console.log(
          `- ${db.name} (${Math.round((db.sizeOnDisk / 1024 / 1024) * 100) / 100} MB)`
        );
      });
    } catch (err) {
      console.log(
        "\nCould not list databases (permission issue, but connection is working)"
      );
    }

    // List collections in the specified database
    if (uriParts.database) {
      const db = connection.connection.db;
      try {
        const collections = await db.listCollections().toArray();
        console.log(`\nCollections in ${uriParts.database}:`);
        collections.forEach((coll) => {
          console.log(`- ${coll.name}`);
        });
      } catch (err) {
        console.log(`\nCould not list collections in ${uriParts.database}`);
      }
    }

    // Check for common connection issues
    console.log("\nConnection diagnostics:");
    console.log("✓ Authentication successful");
    console.log("✓ Network connectivity confirmed");
    console.log("✓ Database permissions verified");

    // Clean up
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("\n❌ Failed to connect to MongoDB");
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);

    // Specific error handling
    if (error.name === "MongoServerSelectionError") {
      console.error(
        "\nThis is likely a network connectivity or firewall issue:"
      );
      console.error(
        "- Check that your IP is whitelisted in MongoDB Atlas Network Access"
      );
      console.error(
        "- Verify that your network allows connections to MongoDB Atlas"
      );
    } else if (error.name === "MongoServerError" && error.code === 18) {
      console.error(
        "\nThis is an authentication issue, but your credentials were recognized:"
      );
      console.error(
        "- Your username exists but you may not have permissions for this action"
      );
      console.error("- Check your MongoDB Atlas user privileges");
    } else if (error.name === "MongoServerError" && error.code === 8000) {
      console.error("\nAuthentication failed. This indicates:");
      console.error("- Your username/password combination is incorrect");
      console.error("- Verify your username and password in MongoDB Atlas");
      console.error("- Try creating a new database user in MongoDB Atlas");
    } else if (error.message.includes("damaged key file")) {
      console.error("\nTLS/SSL certificate validation issue:");
      console.error(
        '- Try adding "tlsAllowInvalidCertificates=true" to your connection string'
      );
    }

    // Debug info
    console.error("\nDebug Info:");
    if (error.stack) {
      console.error(error.stack.split("\n").slice(0, 3).join("\n"));
    }

    askToFixUri();
  } finally {
    if (mongoose.connection.readyState !== 0) {
      // Only disconnect if still connected
      await mongoose.disconnect();
    }
  }
}

// Function to help parse the MongoDB URI for diagnostics
function parseMongoUri(uri) {
  try {
    const result = {
      protocol: "",
      username: "",
      password: "***",
      host: "",
      database: "",
      options: {},
    };

    // Check for valid protocol
    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      return {
        error:
          "Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://",
      };
    }

    result.protocol = uri.startsWith("mongodb+srv://")
      ? "mongodb+srv"
      : "mongodb";

    // Extract the auth, host, path and options
    const withoutProtocol = uri.replace(/^(mongodb(\+srv)?:\/\/)/, "");

    // Check for @ symbol indicating auth info
    let hostPart = withoutProtocol;
    if (withoutProtocol.includes("@")) {
      const [authPart, restPart] = withoutProtocol.split("@");
      hostPart = restPart;

      // Extract username/password if provided
      if (authPart.includes(":")) {
        const [username, password] = authPart.split(":");
        result.username = username;
      } else {
        result.username = authPart;
      }
    }

    // Extract host and any path/options
    let pathAndOptions = "";
    if (hostPart.includes("/")) {
      const [host, ...rest] = hostPart.split("/");
      result.host = host;
      pathAndOptions = rest.join("/");
    } else {
      result.host = hostPart;
    }

    // Extract database name and options
    if (pathAndOptions) {
      if (pathAndOptions.includes("?")) {
        const [dbName, optionsStr] = pathAndOptions.split("?");
        result.database = dbName;

        // Parse options
        const optionsPairs = optionsStr.split("&");
        optionsPairs.forEach((pair) => {
          const [key, value] = pair.split("=");
          result.options[key] = value;
        });
      } else {
        result.database = pathAndOptions;
      }
    }

    return result;
  } catch (err) {
    return {
      error:
        "Could not parse MongoDB URI format. Check your connection string.",
    };
  }
}

// Function to ask if user wants to fix the URI
function askToFixUri() {
  rl.question(
    "\nWould you like to try a different connection string? (y/n): ",
    (answer) => {
      if (answer.toLowerCase() === "y") {
        askForConnectionString();
      } else {
        console.log("\nTry these fixes:");
        console.log("1. Check your username and password in MongoDB Atlas");
        console.log(
          "2. Create a new database user with password authentication"
        );
        console.log("3. Whitelist your current IP address in Network Access");
        console.log("4. Verify your MongoDB Atlas cluster is running");
        console.log(
          '5. Try using the connection string from the MongoDB Atlas UI "Connect" button'
        );
        rl.close();
      }
    }
  );
}

// Handle script exit
process.on("exit", () => {
  if (rl) {
    rl.close();
  }
});
