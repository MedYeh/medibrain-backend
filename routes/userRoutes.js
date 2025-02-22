// routes/userRoutes.js
import express from 'express';
import { createUser,
         loginUser 


} from '../controllers/userController.js';

const router = express.Router();

// POST route to create a new user
router.post('/users', createUser);
router.post("/login", loginUser);

export default router;
