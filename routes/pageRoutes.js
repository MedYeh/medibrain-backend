// routes/pageRoutes.js
import express from 'express';
// Make sure all functions are imported
import { 
    createPage, 
    getPages, 
    getPageById, 
    updatePage, 
    deletePage, 
    searchPages 
} from '../controllers/pageController.js';
import multer from 'multer'; // Assuming you use multer for create/update

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- THIS IS THE CORRECT ORDER ---

// GET list of all pages
router.get('/', getPages);

// GET /api/pages/search - This specific route must come first.
router.get('/search', searchPages);

// GET /api/pages/:id - This general route with a parameter must come second.
router.get('/:id', getPageById);

// POST, PUT, DELETE routes can come after.
router.post('/', upload.any(), createPage);
router.put('/:id', upload.any(), updatePage);
router.delete('/:id', deletePage);

export default router;