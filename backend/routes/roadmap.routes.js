import express from 'express';
import { generateRoadmap } from '../controllers/Student/roadmap.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware());

// POST /roadmap/generate - Generate a learning roadmap
router.post('/generate', generateRoadmap);

export default router;
