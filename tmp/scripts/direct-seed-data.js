/**
 * Lost & Found Portal - Direct Database Seeding Script
 *
 * This script directly adds sample data to your MongoDB database
 * bypassing API endpoints. Use this when your API endpoints aren't
 * fully implemented yet but you need data for testing.
 *
 * Usage: node scripts/direct-seed-data.js
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pathToFileURL } from "url";

// Load environment variables
dotenv.config();

// Sample data
const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@lostfound.edu",
    password: "admin123",
    role: "admin",
  },
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    rollNumber: "CS21001",
    contactPhone: "555-0101",
    department: "Computer Science",
    yearOfStudy: "3rd Year",
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "password123",
    rollNumber: "EC21045",
    contactPhone: "555-0102",
    department: "Electronics",
    yearOfStudy: "2nd Year",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    password: "password123",
    rollNumber: "ME22056",
    contactPhone: "555-0103",
    department: "Mechanical Engineering",
    yearOfStudy: "2nd Year",
  },
  {
    name: "Michael Chen",
    email: "michael.c@example.com",
    password: "password123",
    rollNumber: "PH21023",
    contactPhone: "555-0104",
    department: "Physics",
    yearOfStudy: "3rd Year",
  },
];

const sampleFoundItems = [
  {
    itemName: "Apple iPhone 13",
    category: "Electronics",
    description:
      "Black iPhone 13 with a red case. Found near the library entrance.",
    foundLocation: "Main Library",
    foundDate: new Date("2025-03-25"),
    status: "pending",
    images: [
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=400&auto=format&fit=crop",
    ],
    currentHoldingLocation: "Lost & Found Office",
  },
  {
    itemName: "Blue Hydroflask Water Bottle",
    category: "Personal Items",
    description: "Navy blue 32oz Hydroflask with stickers on the side.",
    foundLocation: "Science Building Room 203",
    foundDate: new Date("2025-03-28"),
    status: "verified",
    isVerified: true,
    images: [
      "https://images.unsplash.com/photo-1575377222312-dd1a63a51638?q=80&w=400&auto=format&fit=crop",
    ],
    currentHoldingLocation: "Department Office",
  },
  {
    itemName: "Calculator TI-84",
    category: "Academic",
    description:
      'Texas Instruments graphing calculator with name "Alex M." engraved on back.',
    foundLocation: "Engineering Hall Room 105",
    foundDate: new Date("2025-03-30"),
    status: "verified",
    isVerified: true,
    images: [
      "https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=400&auto=format&fit=crop",
    ],
    currentHoldingLocation: "Math Department",
  },
  {
    itemName: "Student ID Card",
    category: "Documents",
    description: "University ID card for student Emma Wilson.",
    foundLocation: "Student Center Cafeteria",
    foundDate: new Date("2025-04-01"),
    status: "claimed",
    isVerified: true,
    images: [
      "https://images.unsplash.com/photo-1606837663868-719d913a9219?q=80&w=400&auto=format&fit=crop",
    ],
    currentHoldingLocation: "Student Services",
  },
  {
    itemName: "Nike Running Shoes",
    category: "Clothing",
    description: "Women's Nike Pegasus running shoes, size 8, gray and pink.",
    foundLocation: "Athletics Center",
    foundDate: new Date("2025-04-02"),
    status: "pending",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop",
    ],
    currentHoldingLocation: "Athletics Office",
  },
  {
    itemName: "MacBook Charger",
    category: "Electronics",
    description: "Apple MacBook Pro charger with USB-C connector.",
    foundLocation: "Business Building Lobby",
    foundDate: new Date("2025-04-03"),
    status: "verified",
    isVerified: true,
    images: [
      "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=400&auto=format&fit=crop",
    ],
    currentHoldingLocation: "IT Department",
  },
  {
    itemName: "Ray-Ban Sunglasses",
    category: "Accessories",
    description: "Black Ray-Ban Wayfarer sunglasses in a brown case.",
    foundLocation: "Campus Quad",
    foundDate: new Date("2025-04-05"),
    status: "rejected",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop",
    ],
    currentHoldingLocation: "Lost & Found Office",
  },
  {
    itemName: "Samsung Galaxy Buds",
    category: "Electronics",
    description: "White Samsung wireless earbuds with charging case.",
    foundLocation: "University Center",
    foundDate: new Date("2025-04-07"),
    status: "pending",
    images: [
      "https://images.unsplash.com/photo-1606741965740-7747d3c6155f?q=80&w=400&auto=format&fit=crop",
    ],
    currentHoldingLocation: "Reception Desk",
  },
];

const sampleLostItems = [
  {
    itemName: "Apple AirPods Pro",
    category: "Electronics",
    description: "White AirPods Pro with charging case. Lost during lunch.",
    lostLocation: "Student Center Food Court",
    lostDate: new Date("2025-03-20"),
    status: "lost",
    reward: "$20 reward if found",
    images: [
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=400&auto=format&fit=crop",
    ],
  },
  {
    itemName: "North Face Backpack",
    category: "Personal Items",
    description: "Black North Face Recon backpack with red accents.",
    lostLocation: "Computer Science Building",
    lostDate: new Date("2025-03-29"),
    status: "found",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop",
    ],
  },
  {
    itemName: "Scientific Calculator",
    category: "Academic",
    description:
      "Casio scientific calculator with my name (Michael Chen) on the back.",
    lostLocation: "Physics Lab",
    lostDate: new Date("2025-03-31"),
    status: "lost",
    reward: "$15 reward",
    images: [
      "https://images.unsplash.com/photo-1629454275848-4d608981d83c?q=80&w=400&auto=format&fit=crop",
    ],
  },
  {
    itemName: "Car Keys",
    category: "Keys",
    description:
      "Honda car keys with a blue carabiner and campus parking pass.",
    lostLocation: "Parking Lot B",
    lostDate: new Date("2025-04-01"),
    status: "lost",
    reward: "$30 reward - urgent!",
    images: [
      "https://images.unsplash.com/photo-1580256081112-e49377338b7f?q=80&w=400&auto=format&fit=crop",
    ],
  },
  {
    itemName: "Prescription Glasses",
    category: "Accessories",
    description:
      "Thin black-framed prescription glasses in a red case from LensCrafters.",
    lostLocation: "University Library Study Area",
    lostDate: new Date("2025-04-03"),
    status: "found",
    images: [
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=400&auto=format&fit=crop",
    ],
  },
  {
    itemName: "Blue Notebook",
    category: "Academic",
    description: "Blue Five Star spiral notebook with Calculus III notes.",
    lostLocation: "Mathematics Building",
    lostDate: new Date("2025-04-04"),
    status: "lost",
    images: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=400&auto=format&fit=crop",
    ],
  },
];

const sampleEmailTemplates = [
  {
    name: "Item Found Notification",
    subject: "Good News: We may have found your lost item!",
    body: "Dear {userName},\n\nWe're pleased to inform you that an item matching the description of your lost {itemName} has been turned in to our Lost & Found office.\n\nPlease visit the Lost & Found office at your earliest convenience to verify if this is your item. You'll need to provide proof of ownership.\n\nLocation: {officeLocation}\nOffice Hours: 9:00 AM - 5:00 PM, Monday to Friday\n\nRegards,\nLost & Found Team",
    type: "match",
    isDefault: true,
  },
  {
    name: "Claim Approved",
    subject: "Item Claim Approved",
    body: "Dear {userName},\n\nYour claim for the {itemName} has been approved. You can pick up your item from our office during regular business hours.\n\nPlease bring your ID for verification purposes.\n\nRegards,\nLost & Found Team",
    type: "claim",
    isDefault: true,
  },
  {
    name: "New Item Verification",
    subject: "Action Required: Verify Found Item Details",
    body: "Dear Admin,\n\nA new item ({itemName}) has been reported found and requires verification.\n\nPlease review the details and images uploaded by the user and verify the item information.\n\nRegards,\nSystem Notification",
    type: "verification",
    isDefault: true,
  },
  {
    name: "Monthly Report",
    subject: "Lost & Found Monthly Statistics: {month}",
    body: "Dear Admin,\n\nHere's the monthly report for {month}:\n\n- Total new lost items: {lostCount}\n- Total new found items: {foundCount}\n- Items successfully returned: {returnedCount}\n- Current pending claims: {pendingCount}\n\nThe most commonly lost items this month were in the {topCategory} category.\n\nRegards,\nLost & Found System",
    type: "notification",
    isDefault: false,
  },
];

// Import models
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const modelsDir = join(__dirname, "..", "src", "model");

// Create a schema and model directly without importing the model files
// This avoids the file path issues with ES modules on Windows
async function createModels() {
  try {
    console.log("Creating mongoose models directly...");

    // User model schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: "user" },
      rollNumber: String,
      contactPhone: String,
      department: String,
      yearOfStudy: String,
      image: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    // Found item schema
    const foundItemSchema = new mongoose.Schema({
      itemName: String,
      category: String,
      description: String,
      foundLocation: String,
      foundDate: Date,
      status: { type: String, default: "pending" },
      isVerified: { type: Boolean, default: false },
      images: [String],
      currentHoldingLocation: String,
      reportedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
      },
      verificationSteps: {
        photoVerified: { type: Boolean, default: false },
        descriptionVerified: { type: Boolean, default: false },
        categoryVerified: { type: Boolean, default: false },
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    // Lost item schema
    const lostItemSchema = new mongoose.Schema({
      itemName: String,
      category: String,
      description: String,
      lostLocation: String,
      lostDate: Date,
      status: { type: String, default: "lost" },
      reward: String,
      images: [String],
      reportedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    // Email template schema
    const emailTemplateSchema = new mongoose.Schema({
      name: String,
      subject: String,
      body: String,
      type: String,
      isDefault: { type: Boolean, default: false },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    // Claim request schema
    const claimRequestSchema = new mongoose.Schema({
      item: { type: mongoose.Schema.Types.ObjectId, ref: "FoundItem" },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      proofOfOwnership: String,
      contactPhone: String,
      email: String,
      status: { type: String, default: "pending" },
      adminNotes: String,
      processedAt: Date,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    // Create models
    const User = mongoose.models.User || mongoose.model("User", userSchema);
    const FoundItem =
      mongoose.models.FoundItem || mongoose.model("FoundItem", foundItemSchema);
    const LostItem =
      mongoose.models.LostItem || mongoose.model("LostItem", lostItemSchema);
    const EmailTemplate =
      mongoose.models.EmailTemplate ||
      mongoose.model("EmailTemplate", emailTemplateSchema);
    const ClaimRequest =
      mongoose.models.ClaimRequest ||
      mongoose.model("ClaimRequest", claimRequestSchema);

    return {
      User,
      FoundItem,
      LostItem,
      EmailTemplate,
      ClaimRequest,
    };
  } catch (error) {
    console.error("Error creating models:", error);
    throw error;
  }
}

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/lostnfound";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Hash passwords for users
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Seed users
async function seedUsers(User) {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create users with hashed passwords
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => {
        return {
          ...user,
          password: await hashPassword(user.password),
        };
      })
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

// Seed found items
async function seedFoundItems(FoundItem, users) {
  try {
    // Clear existing found items
    await FoundItem.deleteMany({});
    console.log("Cleared existing found items");

    // Assign random users as reporters
    const foundItemsWithUsers = sampleFoundItems.map((item) => ({
      ...item,
      reportedBy: {
        _id: users[Math.floor(Math.random() * users.length)]._id,
        name: users[Math.floor(Math.random() * users.length)].name,
        email: users[Math.floor(Math.random() * users.length)].email,
      },
      verificationSteps: {
        photoVerified: Math.random() > 0.5,
        descriptionVerified: Math.random() > 0.5,
        categoryVerified: true,
      },
    }));

    const createdItems = await FoundItem.insertMany(foundItemsWithUsers);
    console.log(`Created ${createdItems.length} found items`);
    return createdItems;
  } catch (error) {
    console.error("Error seeding found items:", error);
    throw error;
  }
}

// Seed lost items
async function seedLostItems(LostItem, users) {
  try {
    // Clear existing lost items
    await LostItem.deleteMany({});
    console.log("Cleared existing lost items");

    // Assign random users as reporters
    const lostItemsWithUsers = sampleLostItems.map((item) => ({
      ...item,
      reportedBy: {
        _id: users[Math.floor(Math.random() * users.length)]._id,
        name: users[Math.floor(Math.random() * users.length)].name,
        email: users[Math.floor(Math.random() * users.length)].email,
      },
    }));

    const createdItems = await LostItem.insertMany(lostItemsWithUsers);
    console.log(`Created ${createdItems.length} lost items`);
    return createdItems;
  } catch (error) {
    console.error("Error seeding lost items:", error);
    throw error;
  }
}

// Seed email templates
async function seedEmailTemplates(EmailTemplate, users) {
  try {
    // Clear existing templates
    await EmailTemplate.deleteMany({});
    console.log("Cleared existing email templates");

    // Find admin user
    const adminUser = users.find((user) => user.role === "admin");

    // Create templates with admin as creator
    const templatesWithCreator = sampleEmailTemplates.map((template) => ({
      ...template,
      createdBy: adminUser._id,
    }));

    const createdTemplates =
      await EmailTemplate.insertMany(templatesWithCreator);
    console.log(`Created ${createdTemplates.length} email templates`);
    return createdTemplates;
  } catch (error) {
    console.error("Error seeding email templates:", error);
    throw error;
  }
}

// Seed claim requests
async function seedClaimRequests(ClaimRequest, users, foundItems) {
  try {
    // Clear existing claims
    await ClaimRequest.deleteMany({});
    console.log("Cleared existing claim requests");

    // Create some claim requests
    const claimRequests = [
      {
        item: foundItems.find(
          (item) => item.itemName === "Blue Hydroflask Water Bottle"
        )._id,
        user: users[1]._id, // John Doe
        proofOfOwnership:
          "Can describe the specific stickers on the water bottle and can show purchase receipt.",
        contactPhone: "555-0101",
        email: users[1].email,
        status: "pending",
        adminNotes: "Need to verify ID",
      },
      {
        item: foundItems.find((item) => item.itemName === "Calculator TI-84")
          ._id,
        user: users[2]._id, // Jane Smith
        proofOfOwnership:
          "My name is engraved on the back of the calculator. Student ID matches the name.",
        contactPhone: "555-0102",
        email: users[2].email,
        status: "pending",
      },
      {
        item: foundItems.find((item) => item.itemName === "Student ID Card")
          ._id,
        user: users[3]._id, // Sarah Johnson
        proofOfOwnership: "It's my ID card with my photo and name on it.",
        contactPhone: "555-0103",
        email: users[3].email,
        status: "approved",
        adminNotes: "Verified photo ID matches",
        processedAt: new Date(),
      },
    ];

    const createdClaims = await ClaimRequest.insertMany(claimRequests);
    console.log(`Created ${createdClaims.length} claim requests`);
    return createdClaims;
  } catch (error) {
    console.error("Error seeding claim requests:", error);
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Create models directly without importing
    const { User, FoundItem, LostItem, EmailTemplate, ClaimRequest } =
      await createModels();

    // Seed data
    const users = await seedUsers(User);
    const foundItems = await seedFoundItems(FoundItem, users);
    const lostItems = await seedLostItems(LostItem, users);
    const emailTemplates = await seedEmailTemplates(EmailTemplate, users);
    const claimRequests = await seedClaimRequests(
      ClaimRequest,
      users,
      foundItems
    );

    console.log("Database seeding completed successfully!");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
