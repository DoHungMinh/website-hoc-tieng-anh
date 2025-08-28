import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getUserEnrollments, enrollInCourse } from '../controllers/simpleEnrollmentController';

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(authenticateToken);

// Get user enrollments
router.get('/', getUserEnrollments);

// Enroll in a course
router.post('/', enrollInCourse);

export default router;
