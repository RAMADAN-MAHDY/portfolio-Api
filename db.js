import mongoose from 'mongoose';
import Dotenv from 'dotenv';


Dotenv.config()

const uri = process.env.DB_KEY;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;