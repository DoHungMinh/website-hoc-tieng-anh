import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { enrollInCourse, getUserEnrollments } from '../controllers/enrollmentController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Enroll in a course
router.post('/', enrollInCourse);

// Get user enrollments
router.get('/', getUserEnrollments);

export default router;