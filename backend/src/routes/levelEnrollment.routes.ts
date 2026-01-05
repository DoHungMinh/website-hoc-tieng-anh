import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUserLevelEnrollments,
  checkLevelEnrollment,
  updateLastAccessed
} from '../controllers/levelEnrollmentController';

const router = Router();

// =================================================================
// USER ROUTES (Authentication required)
// =================================================================

// Lấy danh sách level enrollments của user
router.get('/my-enrollments', authenticateToken, getUserLevelEnrollments);

// Kiểm tra user có enrolled trong level cụ thể không
router.get('/check/:level', authenticateToken, checkLevelEnrollment);

// Update lastAccessedAt khi user học
router.post('/update-access', authenticateToken, updateLastAccessed);

export default router;
