const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // MongoDB Connection Options (Updated for latest driver)
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB Atlas');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Enhanced error handling
    if (error.name === 'MongoServerSelectionError') {
      console.error('🔍 Possible issues:');
      console.error('   - Check your MongoDB Atlas connection string');
      console.error('   - Verify your IP address is whitelisted');
      console.error('   - Ensure database user has proper permissions');
      console.error('   - Check your internet connection');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
