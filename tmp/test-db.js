// Simple script to test MongoDB connection and add test data
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

// MongoDB connection URI from environment variable or default
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/lostnfound";

// Define test models (simplified versions of your actual models)
const foundItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  foundLocation: { type: String, required: true },
  foundDate: { type: Date, default: Date.now },
  currentHoldingLocation: { type: String },
  imageURL: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  status: { type: String, default: "found" },
  isVerified: { type: Boolean, default: false },
  claimRequestIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ClaimRequest" },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const lostItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  lostLocation: { type: String, required: true },
  lostDate: { type: Date, default: Date.now },
  imageURL: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  status: { type: String, default: "lost" },
  foundReports: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoundReport" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true },
  password: { type: String },
  image: { type: String },
  role: { type: String, default: "user" },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create models
const FoundItem =
  mongoose.models.FoundItem || mongoose.model("FoundItem", foundItemSchema);
const LostItem =
  mongoose.models.LostItem || mongoose.model("LostItem", lostItemSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Sample data
const testUser = {
  name: "Test User",
  email: "testuser@example.com",
  username: "testuser",
  password: "password123",
  image: "https://randomuser.me/api/portraits/men/1.jpg",
  role: "user",
  isEmailVerified: true,
};

const testFoundItems = [
  {
    itemName: "Blue Backpack",
    description:
      "A navy blue Jansport backpack with red zipper found in the library",
    category: "Bags",
    foundLocation: "Main Library",
    foundDate: new Date(),
    currentHoldingLocation: "Library Lost and Found",
    imageURL:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop",
    contactEmail: "testuser@example.com",
    contactPhone: "555-123-4567",
    status: "found",
    isVerified: true,
  },
  {
    itemName: "iPhone 15",
    description:
      "Black iPhone 15 with a cracked screen protector found in the cafeteria",
    category: "Electronics",
    foundLocation: "Student Cafeteria",
    foundDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    currentHoldingLocation: "Security Office",
    imageURL:
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=1000&auto=format&fit=crop",
    contactEmail: "testuser@example.com",
    contactPhone: "555-123-4567",
    status: "found",
    isVerified: false,
  },
];

const testLostItems = [
  {
    itemName: "Silver MacBook Pro",
    description:
      'MacBook Pro 16" with stickers on the lid. Last seen in the computer lab.',
    category: "Electronics",
    lostLocation: "Computer Science Lab",
    lostDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    imageURL:
      "https://images.unsplash.com/photo-1542393545-10f5cde2c810?q=80&w=1000&auto=format&fit=crop",
    contactEmail: "testuser@example.com",
    contactPhone: "555-123-4567",
    status: "lost",
  },
];

// Function to add test data
async function addTestData() {
  try {
    console.log(
      `Connecting to MongoDB at ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`
    );
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    console.log("✅ Connected to MongoDB successfully");

    // Delete existing test data
    await User.deleteOne({ email: testUser.email });
    await FoundItem.deleteMany({ contactEmail: testUser.email });
    await LostItem.deleteMany({ contactEmail: testUser.email });

    // Add test user
    const user = await User.create(testUser);
    console.log("✅ Created test user:", user.name);

    // Add test found items
    const foundItems = testFoundItems.map((item) => ({
      ...item,
      reportedBy: user._id,
    }));
    const createdFoundItems = await FoundItem.insertMany(foundItems);
    console.log(`✅ Created ${createdFoundItems.length} test found items`);

    // Add test lost items
    const lostItems = testLostItems.map((item) => ({
      ...item,
      reportedBy: user._id,
    }));
    const createdLostItems = await LostItem.insertMany(lostItems);
    console.log(`✅ Created ${createdLostItems.length} test lost items`);

    console.log("\nSample Item IDs for testing:");
    console.log("---------------------------");
    console.log(
      `Found Item ID (for /found-items/[id]): ${createdFoundItems[0]._id}`
    );
    console.log(
      `Lost Item ID (for /lost-items/[id]): ${createdLostItems[0]._id}`
    );

    console.log("\n✅ Test data successfully added to database");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    // Close the mongoose connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Execute the function
addTestData();
