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

// Enrollment route (authenticated users)
router.post('/:id/enroll', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    res.json({
      success: true,
      message: 'Enrollment successful',
      data: {
        courseId: req.params.id,
        userId: req.user?._id,
        enrolledAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Enrollment failed'
    });
  }
});

// Get user enrollments (authenticated users)
router.get('/enrollments', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    // Tạm thời trả về mock data
    res.json({
      success: true,
      enrollments: [],
      totalCourses: 0,
      activeCourses: 0,
      completedCourses: 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments'
    });
  }
});

// Admin routes
router.get('/', authenticateToken, requireAdmin, getCourses);
router.get('/stats', authenticateToken, requireAdmin, getCourseStats);
router.get('/:id', authenticateToken, requireAdmin, getCourseById);
router.post('/', authenticateToken, requireAdmin, createCourse);
router.put('/:id', authenticateToken, requireAdmin, updateCourse);
router.patch('/:id/status', authenticateToken, requireAdmin, updateCourseStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteCourse);

export default router;
