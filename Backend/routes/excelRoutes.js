import express from 'express';
import multer from 'multer';
import { importTemplate, exportTemplate } from '../controllers/excelController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import rateLimiter from '../middlewares/rateLimiter.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/exportwb', requireAuth, exportTemplate); // Authentication required for exporting templates
router.post('/import', requireAuth, rateLimiter, upload.single('file'), importTemplate); // Authentication & rate limiting for imports

export default router;
