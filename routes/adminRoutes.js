// routes/adminRoutes.js
import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'; // Adjust path if needed

const router = express.Router();

// GET /api/admin/stats
// This route requires the user to be authenticated AND have the 'admin' role.
router.get('/stats', requireAuth, requireRole('admin'), getDashboardStats);

export default router;