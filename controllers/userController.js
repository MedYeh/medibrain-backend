// controllers/userController.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const createUser = async (req, res) => {
  try {
    const { nom, prenom, sexe, profil, paysRegions, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user document
    const newUser = await User.create({
      nom,
      prenom,
      sexe,
      profil,
      paysRegions,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user: ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
