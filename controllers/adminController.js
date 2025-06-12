// controllers/adminController.js
import User from '../models/User.js';
import Page from '../models/Page.js';

export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalContent, recentUsers] = await Promise.all([
            User.countDocuments(),
            Page.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(5).select('nom prenom email createdAt'),
        ]);

        res.status(200).json({
            totalUsers,
            totalContent,
            totalRevenue: 0, // Mocked for now
            activeSubscriptions: 0, // Mocked for now
            revenueData: [{ name: 'Juin', revenue: 0 }], // Mocked for now
            recentUsers,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error fetching stats." });
    }
};