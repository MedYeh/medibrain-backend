// server.js
import express from 'express';
import dotenv from 'dotenv';
import connectToDatabase from './utils/db.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON request body
app.use(express.json());

// Connect to MongoDB
connectToDatabase();


// Use routes
app.use('/', userRoutes);

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
