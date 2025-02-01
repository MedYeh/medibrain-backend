// utils/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to connect to MongoDB
const connectToDatabase = async () => {
  try {
    const dbUri = process.env.MONGO_URI;
    if (!dbUri) throw new Error("Mongo URI is not set in the environment variables");
    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectToDatabase;
