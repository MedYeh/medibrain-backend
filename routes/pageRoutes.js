// routes/pageRoutes.js
import express from 'express';
import multer from 'multer';
import {
  createPage,
  getPages,
  getPageById
} from '../controllers/pageController.js';

const router = express.Router();

// Multer in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/pages
 * Expects:
 *   - req.body.sections       (stringified JSON array of your flat sections)
 *   - files named "image_<frontendId>" for each image section
 */
router.post('/', upload.any(), createPage);

// GET list & single-page
router.get('/', getPages);
router.get('/:id', getPageById);

export default router;
