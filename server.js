// server.js
import express from 'express';
import cors from 'cors'; // ✅ Add this import

import dotenv from 'dotenv';
import connectToDatabase from './utils/db.js';
import bodyParser from "body-parser";
import pageRoutes from './routes/pageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // <-- Import

dotenv.config();

const app = express();
// allow large JSON payloads (for base64) if you ever send images inside JSON:
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://medibrain-9d955b214636.herokuapp.com'
  ],
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
app.use('/api/users/', userRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/admin', adminRoutes); // <-- Add this line


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
