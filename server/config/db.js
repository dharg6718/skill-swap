const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Ensure .env is loaded even if started from another working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback default

let memoryServer = null;
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGODB_URI;

  if (uri) {
    connectionPromise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      })
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });

    return connectionPromise;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI is not configured');
  }

  // Fallback to Embedded MongoMemoryServer so the app always works 100%
  try {
    console.log('⚡ Starting Embedded MongoDB Database (Zero-Configuration Fallback)...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ Embedded MongoDB Connected: ${memoryUri}`);

    // Auto-seed initial data if collections are empty
    const User = require('../models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('🌱 Populating initial skills and users...');
      const { seedData } = require('../seed/seed');
      await seedData(true);
      console.log('🎉 Embedded database successfully seeded and ready to use!');
    }
    return conn;
  } catch (memError) {
    console.error('Failed to initialize Embedded MongoDB:', memError.message);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
});

module.exports = connectDB;
