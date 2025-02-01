// models/User.js
import mongoose from 'mongoose';

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, { timestamps: true });

// Create and export the User model
const User = mongoose.model('User', userSchema);
export default User;
