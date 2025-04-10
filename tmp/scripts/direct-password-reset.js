// Direct database script to reset admin password without using models
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

async function resetAdminPasswordDirectly() {
  try {
    // Use a hardcoded connection string for local MongoDB
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    console.log("Connecting directly to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB successfully!");

    // Use the lost-found-portal database
    const db = client.db("lost-found-portal");

    // Get the users collection
    const users = db.collection("users");

    // Find the admin user
    const adminUser = await users.findOne({ email: "admin@lostfound.com" });

    if (adminUser) {
      console.log("Found admin user:", adminUser.email);

      // Generate new password hash with bcrypt
      const newPassword = "password123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      console.log("Generated new password hash with bcrypt");

      // Update the user directly in the database
      const result = await users.updateOne(
        { _id: adminUser._id },
        {
          $set: {
            password: hashedPassword,
            role: "admin",
            isVerified: true,
          },
        }
      );

      if (result.modifiedCount === 1) {
        console.log("Admin password updated successfully!");

        // Verify the password
        const updatedUser = await users.findOne({ _id: adminUser._id });
        console.log("Updated password hash:", updatedUser.password);

        // Test bcrypt comparison
        const passwordMatch = await bcrypt.compare(
          newPassword,
          updatedUser.password
        );
        console.log(
          "Password verification test:",
          passwordMatch ? "PASSED" : "FAILED"
        );
      } else {
        console.log("Failed to update admin password.");
      }
    } else {
      console.log("Admin user not found. Creating new admin user...");

      // Create a new admin user
      const newPassword = "password123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const newAdmin = {
        name: "Admin User",
        email: "admin@lostfound.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        phoneNumber: "9876543210",
        institution: "Admin Institute",
      };

      const result = await users.insertOne(newAdmin);

      if (result.acknowledged) {
        console.log("New admin user created with ID:", result.insertedId);
      } else {
        console.log("Failed to create admin user.");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the MongoDB client
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the function
resetAdminPasswordDirectly();
