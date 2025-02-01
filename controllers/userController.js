// controllers/userController.js
import User from '../models/User.js';

export const createUser = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Create a new user
    const newUser = new User({ email });
    await newUser.save();

    return res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
