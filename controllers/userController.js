// controllers/userController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

export const loginUser = async (req, res) => {
  const { email, password} = req.body;
  const secretKey = "VOTRE_CLE_SECRETE";
  console.log("loginUser called");
  console.log("Req body : ", req.body);
  try {
    const user = await User.findOne({ email: email });
    console.log("User", user);

    if (!user) {
      return res.status(400).send({ message: "Utilisateur non trouvé" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).send({ message: "Identifiants invalides" });
    }


    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1d",
    });
    res.status(200).send({
      token,
      user: user,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Erreur lors de la connexion", error: error.message });
  }
};
