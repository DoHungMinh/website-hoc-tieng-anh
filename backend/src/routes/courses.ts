import express from 'express';
import {
  getCourses,
  getPublicCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
  getCourseStats
} from '../controllers/courseController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/public', getPublicCourses);
router.get('/public/:id', getCourseById);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getCourses);
router.get('/stats', authenticateToken, requireAdmin, getCourseStats);
router.get('/:id', authenticateToken, requireAdmin, getCourseById);
router.post('/', authenticateToken, requireAdmin, createCourse);
router.put('/:id', authenticateToken, requireAdmin, updateCourse);
router.patch('/:id/status', authenticateToken, requireAdmin, updateCourseStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteCourse);

export default router;
