// Simple script to seed the database with test data
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Connect to MongoDB
console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// Define schemas similar to your models
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    phoneNumber: String,
    institution: String,
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    reportedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "LostItem" }],
    foundItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoundItem" }],
    claimedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoundItem" }],
  },
  { timestamps: true }
);

const lostItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    lastLocation: { type: String, required: true },
    dateLost: { type: Date, required: true },
    imageURL: String,
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contactEmail: { type: String, required: true },
    contactPhone: String,
    status: {
      type: String,
      enum: ["lost", "found", "claimed", "foundReported", "pending_claim"],
      default: "lost",
    },
    foundReports: [
      { type: mongoose.Schema.Types.ObjectId, ref: "FoundReport" },
    ],
    matchedWithFoundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoundItem",
    },
  },
  { timestamps: true }
);

const foundItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    foundLocation: { type: String, required: true },
    dateFound: { type: Date, required: true },
    imageURL: String,
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["available", "claimed", "returned", "pending"],
      default: "available",
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isVerified: { type: Boolean, default: false },
    matchedWithLostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LostItem",
    },
  },
  { timestamps: true }
);

// Create models
const User = mongoose.models.User || mongoose.model("User", userSchema);
const LostItem =
  mongoose.models.LostItem || mongoose.model("LostItem", lostItemSchema);
const FoundItem =
  mongoose.models.FoundItem || mongoose.model("FoundItem", foundItemSchema);

// Sample data
const createSampleData = async () => {
  try {
    // Create some users
    console.log("Creating sample users...");

    // Create an admin user
    const adminUser = await User.findOneAndUpdate(
      { email: "admin@lostfound.com" },
      {
        name: "Admin User",
        email: "admin@lostfound.com",
        password:
          "$2a$12$1InE3IwscLmTQBNNNtxqb.kwbYS1UVYwnzCdrsJzRMfS/P.3vhBLK", // 'password123'
        phoneNumber: "9876543210",
        institution: "Thapar Institute",
        role: "admin",
        isVerified: true,
      },
      { upsert: true, new: true }
    );
    console.log("Admin user created:", adminUser._id);

    // Create a regular user
    const regularUser = await User.findOneAndUpdate(
      { email: "user@lostfound.com" },
      {
        name: "Regular User",
        email: "user@lostfound.com",
        password:
          "$2a$12$1InE3IwscLmTQBNNNtxqb.kwbYS1UVYwnzCdrsJzRMfS/P.3vhBLK", // 'password123'
        phoneNumber: "9876543211",
        institution: "Thapar Institute",
        role: "user",
        isVerified: true,
      },
      { upsert: true, new: true }
    );
    console.log("Regular user created:", regularUser._id);

    // Create some lost items
    console.log("Creating sample lost items...");
    const lostItems = [
      {
        itemName: "Apple MacBook Pro",
        description: 'Silver 13" MacBook Pro with sticker on the back',
        category: "Electronics",
        lastLocation: "Central Library",
        dateLost: new Date("2025-04-05T10:30:00"),
        reportedBy: regularUser._id,
        contactEmail: regularUser.email,
        contactPhone: regularUser.phoneNumber,
        status: "lost",
      },
      {
        itemName: "Blue Backpack",
        description: "Navy blue Wildcraft backpack with red zipper",
        category: "Accessories",
        lastLocation: "Hostel C Common Room",
        dateLost: new Date("2025-04-07T15:45:00"),
        reportedBy: regularUser._id,
        contactEmail: regularUser.email,
        contactPhone: regularUser.phoneNumber,
        status: "lost",
      },
      {
        itemName: "Student ID Card",
        description: "Thapar University student ID card",
        category: "ID Cards",
        lastLocation: "Cafeteria",
        dateLost: new Date("2025-04-08T12:00:00"),
        reportedBy: regularUser._id,
        contactEmail: regularUser.email,
        contactPhone: regularUser.phoneNumber,
        status: "lost",
      },
    ];

    for (const item of lostItems) {
      const lostItem = await LostItem.findOneAndUpdate(
        {
          itemName: item.itemName,
          reportedBy: item.reportedBy,
          dateLost: item.dateLost,
        },
        item,
        { upsert: true, new: true }
      );
      console.log("Lost item created:", lostItem._id);
    }

    // Create some found items
    console.log("Creating sample found items...");
    const foundItems = [
      {
        itemName: "Black Wallet",
        description: "Leather wallet with college ID inside",
        category: "Accessories",
        foundLocation: "Lecture Hall 2",
        dateFound: new Date("2025-04-06T16:30:00"),
        reportedBy: adminUser._id,
        status: "available",
        isVerified: true,
      },
      {
        itemName: "Wireless Earbuds",
        description: "White wireless earbuds with charging case",
        category: "Electronics",
        foundLocation: "Sports Complex",
        dateFound: new Date("2025-04-09T08:15:00"),
        reportedBy: adminUser._id,
        status: "available",
        isVerified: true,
      },
      {
        itemName: "Textbook",
        description: "Computer Networks textbook by Tanenbaum",
        category: "Books",
        foundLocation: "Department Building",
        dateFound: new Date("2025-04-09T14:20:00"),
        reportedBy: regularUser._id,
        status: "pending",
        isVerified: false,
      },
    ];

    for (const item of foundItems) {
      const foundItem = await FoundItem.findOneAndUpdate(
        {
          itemName: item.itemName,
          reportedBy: item.reportedBy,
          dateFound: item.dateFound,
        },
        item,
        { upsert: true, new: true }
      );
      console.log("Found item created:", foundItem._id);
    }

    console.log("Sample data creation completed!");
  } catch (error) {
    console.error("Error creating sample data:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

// Run the data creation function
createSampleData();
