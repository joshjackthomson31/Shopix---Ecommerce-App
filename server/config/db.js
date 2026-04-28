import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from config
    const conn = await mongoose.connect(config.mongoUri);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
