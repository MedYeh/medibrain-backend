// server.js
import express from 'express';
import cors from 'cors'; // ✅ Add this import

import dotenv from 'dotenv';
import connectToDatabase from './utils/db.js';
import bodyParser from "body-parser";
import pageRoutes from './routes/pageRoutes.js';
import userRoutes from './routes/userRoutes.js';
dotenv.config();

const app = express();
// ✅ Use CORS before the routes
app.use(cors({
  origin: ['http://localhost:5173', 'https://medibrain-9d955b214636.herokuapp.com','http://localhost:5000'],
  credentials: true
}));
// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Connect to MongoDB
connectToDatabase();

// Simple health-check route
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// Use the user routes with the base path '/'
app.use('/', userRoutes);
app.use('/', pageRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
