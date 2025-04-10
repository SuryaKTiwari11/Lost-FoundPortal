// Simple script to test API endpoints by making HTTP requests
require("dotenv").config();
const http = require("http");

// Function to make HTTP GET requests to your API endpoints
function makeGetRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3001, // Updated port to 3001
      path: path,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);

      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (e) {
          console.log("Response is not JSON:", data);
          resolve(data);
        }
      });
    });

    req.on("error", (error) => {
      console.error(`Error making request to ${path}:`, error.message);
      reject(error);
    });

    req.end();
  });
}

// Main function to test the API endpoints
async function testApi() {
  console.log("Starting API tests...");
  console.log(
    "Note: Make sure your Next.js application is running on port 3001"
  );
  console.log(
    "---------------------------------------------------------------"
  );

  try {
    // Test 1: Get all items
    console.log("\nTest 1: Get all items");
    console.log("GET /api/items");
    const allItems = await makeGetRequest("/api/items");
    console.log("Response:", allItems.success ? "Success" : "Failed");
    console.log(
      `Total items: ${allItems.data ? allItems.data.total : "unknown"}`
    );

    // Test 2: Get lost items
    console.log("\nTest 2: Get lost items");
    console.log("GET /api/items?type=lost");
    const lostItems = await makeGetRequest("/api/items?type=lost");
    console.log("Response:", lostItems.success ? "Success" : "Failed");
    console.log(
      `Lost items count: ${lostItems.data ? lostItems.data.lostItems.length : "unknown"}`
    );

    // Test 3: Get found items
    console.log("\nTest 3: Get found items");
    console.log("GET /api/items?type=found");
    const foundItems = await makeGetRequest("/api/items?type=found");
    console.log("Response:", foundItems.success ? "Success" : "Failed");
    console.log(
      `Found items count: ${foundItems.data ? foundItems.data.foundItems.length : "unknown"}`
    );

    // Test 4: Search items
    console.log("\nTest 4: Search items by query");
    console.log("GET /api/items?query=backpack");
    const searchItems = await makeGetRequest("/api/items?query=backpack");
    console.log("Response:", searchItems.success ? "Success" : "Failed");
    console.log(
      `Search results count: ${searchItems.data ? searchItems.data.total : "unknown"}`
    );
  } catch (error) {
    console.error("Error running API tests:", error);
    console.log("\nMake sure your Next.js app is running. Start it with:");
    console.log("npm run dev");
  }
}

// Run the tests
testApi();
