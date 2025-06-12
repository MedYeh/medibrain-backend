// routes/pageRoutes.js
import express from 'express';
import multer from 'multer';
import {
    createPage,
    getPages,
    getPageById,
    updatePage,   // Import new controller
    deletePage    // Import new controller
} from '../controllers/pageController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CREATE
router.post('/', upload.any(), createPage);

// READ
router.get('/', getPages);
router.get('/:id', getPageById);

// UPDATE
router.put('/:id', upload.any(), updatePage);

// DELETE
router.delete('/:id', deletePage);

export default router;