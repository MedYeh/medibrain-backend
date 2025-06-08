import express from 'express';
import {
  createPage,
  getPages,
  getPageById
} from '../controllers/pageController.js';

const router = express.Router();

// Create a new page
router.post('/', createPage);

// List all pages (lightweight)
router.get('/', getPages);

// Get one page by ID (full content)
router.get('/:id', getPageById);

export default router;
