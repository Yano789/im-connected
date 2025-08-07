import mongoose from 'mongoose';

/**
 * Database configuration and connection
 */
export const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicationdb';
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
