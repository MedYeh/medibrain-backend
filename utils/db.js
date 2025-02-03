import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// Middleware to parse JSON request body
app.use(express.json());

// MongoDB Connection Logic
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("Mongo URI is not set in the environment variables");
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connection initiated..."))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

mongoose.connection.once("open", () => {
  console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);
});

// Simple health-check route
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// Use routes with an optional prefix
app.use("/", userRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
