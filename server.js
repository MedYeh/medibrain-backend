// server.js
import express from 'express';
import dotenv from 'dotenv';
import connectToDatabase from './utils/db.js';
import bodyParser from "body-parser";

import userRoutes from './routes/userRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
dotenv.config();

const app = express();

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
app.use('/content', contentRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
