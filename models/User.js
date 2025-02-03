// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    sexe: { type: String, required: true, enum: ['homme', 'femme'] },
    profil: { type: String, required: true, enum: ['patient', 'medecin'] },
    paysRegions: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
