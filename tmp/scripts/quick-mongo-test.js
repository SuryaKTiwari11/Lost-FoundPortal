// CommonJS module for testing MongoDB connection
const mongodb = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually load .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      // Skip comments and empty lines
      if (line.startsWith('#') || !line.trim()) return;
      
      // Parse key=value pairs
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        process.env[key] = value;
      }
    });
    
    console.log('✅ Loaded environment variables from .env file');
  } catch (error) {
    console.error('Error loading .env file:', error.message);
  }
}

// Load environment variables
loadEnv();

// Use MongoDB connection string from environment
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.error('Please check your .env file');
  process.exit(1);
}

console.log('MongoDB URI:', uri.replace(/:[^:]*@/, ':****@'));

// Create MongoDB client with options
const client = new mongodb.MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,  // 5 seconds timeout for server selection
  socketTimeoutMS: 10000,          // 10 seconds for socket operations
  connectTimeoutMS: 10000,         // 10 seconds for initial connection
});

// Test connection with timeout
console.log('Connecting to MongoDB...');
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Connection timed out after 15 seconds')), 15000);
});

// Try to connect
Promise.race([
  client.connect().then(async () => {
    console.log('✅ Connected successfully to MongoDB Atlas!');
    
    try {
      const db = client.db();
      console.log(`Database name: ${db.databaseName}`);
      
      const collections = await db.listCollections().toArray();
      console.log(`Found ${collections.length} collections:`);
      collections.forEach(coll => console.log(` - ${coll.name}`));
      
    } catch (err) {
      console.error('Error listing collections:', err);
    }
    
    console.log('\nClosing connection...');
    await client.close();
    console.log('Connection closed');
  }),
  timeoutPromise
])
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  console.error('Please check your MongoDB Atlas URI and network settings');
  process.exit(1);
});