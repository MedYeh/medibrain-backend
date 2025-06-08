// routes/pageRoutes.js
import express from 'express';
import {
  createPage,
  getPages,
  getPageById
} from '../controllers/pageController.js';

const router = express.Router();

// Route to create a new page and get all pages (lightweight version)
router.post('/pages', createPage);
router.get('/getpages', getPages);

// Route to get a single page by its ID (full content)
router.get('/pages/:id', getPageById);
// You can later add: router.put('/pages/:id', updatePage); etc.

export default router;
