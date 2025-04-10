// Seed script to populate the database with realistic demo data
const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Import models
const { FoundItem } = require("../src/model/foundItem.model");
const { LostItem } = require("../src/model/lostItem.model");
const { User } = require("../src/model/user.model");
const { ClaimRequest } = require("../src/model/claimRequest.model");
const { EmailTemplate } = require("../src/model/emailTemplate.model");

// Sample users
const sampleUsers = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    role: "user",
    rollNumber: "CS21001",
    contactPhone: "555-0101",
    department: "Computer Science",
    yearOfStudy: "3rd Year",
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    role: "user",
    rollNumber: "EC21045",
    contactPhone: "555-0102",
    department: "Electronics",
    yearOfStudy: "2nd Year",
  },
  {
    name: "Admin User",
    email: "admin@lostfound.edu",
    role: "admin",
    image: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    role: "user",
    rollNumber: "ME22056",
    contactPhone: "555-0103",
    department: "Mechanical Engineering",
    yearOfStudy: "2nd Year",
  },
  {
    name: "Michael Chen",
    email: "michael.c@example.com",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    role: "user",
    rollNumber: "PH21023",
    contactPhone: "555-0104",
    department: "Physics",
    yearOfStudy: "3rd Year",
  },
];

// Sample found items
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

// Sample lost items
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

// Sample claim requests
const sampleClaimRequests = [
  {
    proofOfOwnership:
      "Can describe the specific stickers on the water bottle and can show purchase receipt.",
    contactPhone: "555-0101",
    status: "pending",
    adminNotes: "Need to verify ID",
  },
  {
    proofOfOwnership:
      "Can unlock the iPhone and show that it belongs to me. Also have the receipt.",
    contactPhone: "555-0104",
    status: "approved",
    adminNotes: "Verified ownership through device unlock",
    processedAt: new Date("2025-04-03"),
  },
  {
    proofOfOwnership:
      "My name is engraved on the back of the calculator. Student ID matches the name.",
    contactPhone: "555-0102",
    status: "pending",
  },
];

// Sample email templates
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

// Seed function
const seedData = async () => {
  try {
    // Clear existing data
    await FoundItem.deleteMany({});
    await LostItem.deleteMany({});
    await User.deleteMany({});
    await ClaimRequest.deleteMany({});
    await EmailTemplate.deleteMany({});

    console.log("Cleared existing data");

    // Insert users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Inserted ${createdUsers.length} users`);

    // Insert found items - assign to random users
    const foundItems = sampleFoundItems.map((item) => ({
      ...item,
      reportedBy: {
        _id: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id,
        name: createdUsers[Math.floor(Math.random() * createdUsers.length)]
          .name,
        email:
          createdUsers[Math.floor(Math.random() * createdUsers.length)].email,
      },
    }));

    const createdFoundItems = await FoundItem.insertMany(foundItems);
    console.log(`Inserted ${createdFoundItems.length} found items`);

    // Insert lost items - assign to random users
    const lostItems = sampleLostItems.map((item) => ({
      ...item,
      reportedBy: {
        _id: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id,
        name: createdUsers[Math.floor(Math.random() * createdUsers.length)]
          .name,
        email:
          createdUsers[Math.floor(Math.random() * createdUsers.length)].email,
      },
    }));

    const createdLostItems = await LostItem.insertMany(lostItems);
    console.log(`Inserted ${createdLostItems.length} lost items`);

    // Create claim requests - link to random found items and users
    const claimRequests = sampleClaimRequests.map((claim, index) => ({
      ...claim,
      item: createdFoundItems[index % createdFoundItems.length]._id,
      user: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id,
    }));

    const createdClaims = await ClaimRequest.insertMany(claimRequests);
    console.log(`Inserted ${createdClaims.length} claim requests`);

    // Insert email templates - assign admin user as creator
    const adminUser = createdUsers.find((user) => user.role === "admin");
    const emailTemplates = sampleEmailTemplates.map((template) => ({
      ...template,
      createdBy: adminUser._id,
    }));

    const createdTemplates = await EmailTemplate.insertMany(emailTemplates);
    console.log(`Inserted ${createdTemplates.length} email templates`);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Execute the seeding
connectToMongoDB().then(seedData);
