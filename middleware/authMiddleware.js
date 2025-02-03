import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token format

  if (!token) {
    return res.status(401).send({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ message: "Invalid token", error: error.message });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ message: "Access forbidden: insufficient rights" });
    }
    next();
  };
};

export { requireAuth, requireRole };
