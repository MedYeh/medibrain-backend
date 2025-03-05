// routes/contentRoutes.js
import express from 'express';
import { getContent, saveContent } from '../controllers/contentController.js';

const router = express.Router();

// GET => fetch the single page's content
router.get('/', getContent);

// POST => update or create the single page
router.post('/', saveContent);

export default router;
