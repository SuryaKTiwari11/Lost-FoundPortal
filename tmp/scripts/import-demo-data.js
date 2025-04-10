/**
 * Lost & Found Portal - Demo Data Import Script
 * 
 * This script sends HTTP requests to your application's API endpoints
 * to create realistic demo data in your database.
 * 
 * Run this script after starting your application:
 * node scripts/import-demo-data.js
 */

// Using ESM syntax for node-fetch
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@lostfound.edu';
const ADMIN_PASSWORD = 'admin123'; // Change this for production

// Sample data arrays
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    rollNumber: 'CS21001',
    contactPhone: '555-0101',
    department: 'Computer Science',
    yearOfStudy: '3rd Year',
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    rollNumber: 'EC21045',
    contactPhone: '555-0102',
    department: 'Electronics',
    yearOfStudy: '2nd Year',
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    password: 'password123',
    rollNumber: 'ME22056',
    contactPhone: '555-0103',
    department: 'Mechanical Engineering',
    yearOfStudy: '2nd Year',
  },
  {
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    password: 'password123',
    rollNumber: 'PH21023',
    contactPhone: '555-0104',
    department: 'Physics',
    yearOfStudy: '3rd Year',
  }
];

const sampleFoundItems = [
  {
    itemName: 'Apple iPhone 13',
    category: 'Electronics',
    description: 'Black iPhone 13 with a red case. Found near the library entrance.',
    foundLocation: 'Main Library',
    foundDate: '2025-03-25',
    additionalInfo: 'The phone was locked but had a picture of a dog as the wallpaper.',
    imageUrl: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=400&auto=format&fit=crop',
    currentHoldingLocation: 'Lost & Found Office'
  },
  {
    itemName: 'Blue Hydroflask Water Bottle',
    category: 'Personal Items',
    description: 'Navy blue 32oz Hydroflask with stickers on the side.',
    foundLocation: 'Science Building Room 203',
    foundDate: '2025-03-28',
    additionalInfo: 'Has stickers from national parks and a university logo.',
    imageUrl: 'https://images.unsplash.com/photo-1575377222312-dd1a63a51638?q=80&w=400&auto=format&fit=crop',
    currentHoldingLocation: 'Department Office'
  },
  {
    itemName: 'Calculator TI-84',
    category: 'Academic',
    description: 'Texas Instruments graphing calculator with name "Alex M." engraved on back.',
    foundLocation: 'Engineering Hall Room 105',
    foundDate: '2025-03-30',
    additionalInfo: 'Has some stickers and the name Alex M. engraved on the back.',
    imageUrl: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=400&auto=format&fit=crop',
    currentHoldingLocation: 'Math Department'
  },
  {
    itemName: 'Student ID Card',
    category: 'Documents',
    description: 'University ID card for student Emma Wilson.',
    foundLocation: 'Student Center Cafeteria',
    foundDate: '2025-04-01',
    additionalInfo: 'Found under a table in the cafeteria area.',
    imageUrl: 'https://images.unsplash.com/photo-1606837663868-719d913a9219?q=80&w=400&auto=format&fit=crop',
    currentHoldingLocation: 'Student Services'
  },
  {
    itemName: 'Nike Running Shoes',
    category: 'Clothing',
    description: 'Women\'s Nike Pegasus running shoes, size 8, gray and pink.',
    foundLocation: 'Athletics Center',
    foundDate: '2025-04-02',
    additionalInfo: 'Found in the women\'s locker room.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop',
    currentHoldingLocation: 'Athletics Office'
  },
  {
    itemName: 'MacBook Charger',
    category: 'Electronics',
    description: 'Apple MacBook Pro charger with USB-C connector.',
    foundLocation: 'Business Building Lobby',
    foundDate: '2025-04-03',
    additionalInfo: 'Found plugged into a wall outlet in the lobby.',
    imageUrl: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=400&auto=format&fit=crop',
    currentHoldingLocation: 'IT Department'
  },
  {
    itemName: 'Ray-Ban Sunglasses',
    category: 'Accessories',
    description: 'Black Ray-Ban Wayfarer sunglasses in a brown case.',
    foundLocation: 'Campus Quad',
    foundDate: '2025-04-05',
    additionalInfo: 'Found on a bench near the fountain.',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop',
    currentHoldingLocation: 'Lost & Found Office'
  },
  {
    itemName: 'Samsung Galaxy Buds',
    category: 'Electronics',
    description: 'White Samsung wireless earbuds with charging case.',
    foundLocation: 'University Center',
    foundDate: '2025-04-07',
    additionalInfo: 'Found on a study table.',
    imageUrl: 'https://images.unsplash.com/photo-1606741965740-7747d3c6155f?q=80&w=400&auto=format&fit=crop',
    currentHoldingLocation: 'Reception Desk'
  }
];

const sampleLostItems = [
  {
    itemName: 'Apple AirPods Pro',
    category: 'Electronics',
    description: 'White AirPods Pro with charging case. Lost during lunch.',
    lostLocation: 'Student Center Food Court',
    lostDate: '2025-03-20',
    additionalInfo: 'Has a small scratch on the case.',
    reward: '$20 reward if found',
    imageUrl: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=400&auto=format&fit=crop'
  },
  {
    itemName: 'North Face Backpack',
    category: 'Personal Items',
    description: 'Black North Face Recon backpack with red accents.',
    lostLocation: 'Computer Science Building',
    lostDate: '2025-03-29',
    additionalInfo: 'Contains textbooks and a laptop.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop'
  },
  {
    itemName: 'Scientific Calculator',
    category: 'Academic',
    description: 'Casio scientific calculator with my name (Michael Chen) on the back.',
    lostLocation: 'Physics Lab',
    lostDate: '2025-03-31',
    additionalInfo: 'Need it urgently for exams.',
    reward: '$15 reward',
    imageUrl: 'https://images.unsplash.com/photo-1629454275848-4d608981d83c?q=80&w=400&auto=format&fit=crop'
  },
  {
    itemName: 'Car Keys',
    category: 'Keys',
    description: 'Honda car keys with a blue carabiner and campus parking pass.',
    lostLocation: 'Parking Lot B',
    lostDate: '2025-04-01',
    additionalInfo: 'Has a Honda logo and a blue carabiner.',
    reward: '$30 reward - urgent!',
    imageUrl: 'https://images.unsplash.com/photo-1580256081112-e49377338b7f?q=80&w=400&auto=format&fit=crop'
  },
  {
    itemName: 'Prescription Glasses',
    category: 'Accessories',
    description: 'Thin black-framed prescription glasses in a red case from LensCrafters.',
    lostLocation: 'University Library Study Area',
    lostDate: '2025-04-03',
    additionalInfo: 'I cannot see well without them and need them urgently.',
    imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=400&auto=format&fit=crop'
  },
  {
    itemName: 'Blue Notebook',
    category: 'Academic',
    description: 'Blue Five Star spiral notebook with Calculus III notes.',
    lostLocation: 'Mathematics Building',
    lostDate: '2025-04-04',
    additionalInfo: 'Contains all my notes for the semester final.',
    imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=400&auto=format&fit=crop'
  }
];

const sampleEmailTemplates = [
  {
    name: 'Item Found Notification',
    subject: 'Good News: We may have found your lost item!',
    body: 'Dear {userName},\n\nWe\'re pleased to inform you that an item matching the description of your lost {itemName} has been turned in to our Lost & Found office.\n\nPlease visit the Lost & Found office at your earliest convenience to verify if this is your item. You\'ll need to provide proof of ownership.\n\nLocation: {officeLocation}\nOffice Hours: 9:00 AM - 5:00 PM, Monday to Friday\n\nRegards,\nLost & Found Team',
    type: 'match',
  },
  {
    name: 'Claim Approved',
    subject: 'Item Claim Approved',
    body: 'Dear {userName},\n\nYour claim for the {itemName} has been approved. You can pick up your item from our office during regular business hours.\n\nPlease bring your ID for verification purposes.\n\nRegards,\nLost & Found Team',
    type: 'claim',
  },
  {
    name: 'New Item Verification',
    subject: 'Action Required: Verify Found Item Details',
    body: 'Dear Admin,\n\nA new item ({itemName}) has been reported found and requires verification.\n\nPlease review the details and images uploaded by the user and verify the item information.\n\nRegards,\nSystem Notification',
    type: 'verification',
  },
  {
    name: 'Monthly Report',
    subject: 'Lost & Found Monthly Statistics: {month}',
    body: 'Dear Admin,\n\nHere\'s the monthly report for {month}:\n\n- Total new lost items: {lostCount}\n- Total new found items: {foundCount}\n- Items successfully returned: {returnedCount}\n- Current pending claims: {pendingCount}\n\nThe most commonly lost items this month were in the {topCategory} category.\n\nRegards,\nLost & Found System',
    type: 'notification',
  }
];

// Main function to import all data
async function importAllData() {
  console.log('Starting data import process...');
  
  try {
    // Create users first
    const userTokens = await createUsers();
    
    // Use the first user token to create items
    if (userTokens && userTokens.length > 0) {
      const userToken = userTokens[0].token;
      
      // Create found items
      await createFoundItems(userToken);
      
      // Create lost items
      await createLostItems(userToken);
      
      // Create email templates (needs admin access)
      // First check if we have admin token
      const adminToken = userTokens.find(u => u.email === ADMIN_EMAIL)?.token;
      if (adminToken) {
        await createEmailTemplates(adminToken);
      } else {
        console.log('Admin token not available. Skipping email templates creation.');
      }
      
      console.log('Data import completed successfully!');
    } else {
      console.log('Failed to create users. Aborting import process.');
    }
  } catch (error) {
    console.error('Error during import process:', error);
  }
}

// Function to create users
async function createUsers() {
  console.log('Creating users...');
  
  const userTokens = [];
  
  // First check if admin exists, if not create one
  try {
    const adminData = {
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin'
    };
    
    // Try to create admin
    const adminResponse = await fetch(`${BASE_URL}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    
    const adminResult = await adminResponse.json();
    
    if (adminResult.success) {
      console.log('Admin user created successfully');
      
      // Login as admin to get token
      const loginResponse = await fetch(`${BASE_URL}/api/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });
      
      const loginResult = await loginResponse.json();
      
      if (loginResult.success && loginResult.token) {
        userTokens.push({
          email: ADMIN_EMAIL,
          token: loginResult.token
        });
      }
    } else {
      console.log('Admin user might already exist, attempting login');
      
      // Try logging in
      const loginResponse = await fetch(`${BASE_URL}/api/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });
      
      const loginResult = await loginResponse.json();
      
      if (loginResult.success && loginResult.token) {
        userTokens.push({
          email: ADMIN_EMAIL,
          token: loginResult.token
        });
      }
    }
    
    // Create regular users
    for (const user of sampleUsers) {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/sign-up`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log(`User created: ${user.email}`);
          
          // Login to get token
          const loginResponse = await fetch(`${BASE_URL}/api/auth/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              password: user.password
            })
          });
          
          const loginResult = await loginResponse.json();
          
          if (loginResult.success && loginResult.token) {
            userTokens.push({
              email: user.email,
              token: loginResult.token
            });
          }
        } else {
          console.log(`User creation failed for ${user.email}: ${result.error}`);
        }
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
    
    console.log(`Created ${userTokens.length} users`);
    return userTokens;
    
  } catch (error) {
    console.error('Error in user creation process:', error);
    return [];
  }
}

// Function to create found items
async function createFoundItems(token) {
  console.log('Creating found items...');
  
  let createdCount = 0;
  
  for (const item of sampleFoundItems) {
    try {
      const response = await fetch(`${BASE_URL}/api/items/report-found`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`Found item created: ${item.itemName}`);
        createdCount++;
      } else {
        console.log(`Found item creation failed for ${item.itemName}: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error creating found item ${item.itemName}:`, error);
    }
  }
  
  console.log(`Created ${createdCount} found items`);
}

// Function to create lost items
async function createLostItems(token) {
  console.log('Creating lost items...');
  
  let createdCount = 0;
  
  for (const item of sampleLostItems) {
    try {
      const response = await fetch(`${BASE_URL}/api/lost-items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`Lost item created: ${item.itemName}`);
        createdCount++;
      } else {
        console.log(`Lost item creation failed for ${item.itemName}: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error creating lost item ${item.itemName}:`, error);
    }
  }
  
  console.log(`Created ${createdCount} lost items`);
}

// Function to create email templates
async function createEmailTemplates(adminToken) {
  console.log('Creating email templates...');
  
  let createdCount = 0;
  
  for (const template of sampleEmailTemplates) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/email-templates`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(template)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`Email template created: ${template.name}`);
        createdCount++;
      } else {
        console.log(`Email template creation failed for ${template.name}: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error creating email template ${template.name}:`, error);
    }
  }
  
  console.log(`Created ${createdCount} email templates`);
}

// Run the import process
importAllData().catch(console.error);