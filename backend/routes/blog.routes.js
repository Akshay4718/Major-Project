import express from 'express';
import * as blogController from '../controllers/Student/blog.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware());

// Create a new blog
router.post('/create', blogController.createBlog);

// Get all blogs (with optional filters)
router.get('/all', blogController.getAllBlogs);

// Get user's own blogs
router.get('/my-blogs', blogController.getMyBlogs);

// Get single blog by ID
router.get('/:blogId', blogController.getBlogById);

// Like/Unlike a blog
router.post('/:blogId/like', blogController.toggleLike);

// Delete a blog
router.delete('/:blogId', blogController.deleteBlog);

export default router;
