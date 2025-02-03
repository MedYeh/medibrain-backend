// utils/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error("Mongo URI is not set in the environment variables");
}

const connectToDatabase = () => {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("MongoDB connection initiated...");
      console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
};

export default connectToDatabase;
