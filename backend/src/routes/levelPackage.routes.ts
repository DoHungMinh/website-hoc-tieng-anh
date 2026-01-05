import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getAllLevelPackages,
  getLevelPackageDetail,
  updateLevelPackage,
  getLevelPackageStats
} from '../controllers/levelPackageController';

const router = Router();

// =================================================================
// PUBLIC ROUTES (No authentication required)
// =================================================================

// Lấy tất cả level packages (6 hộp thẻ A1-C2)
router.get('/', getAllLevelPackages);

// Lấy chi tiết level package + courses trong level
router.get('/:level', getLevelPackageDetail);

// =================================================================
// ADMIN ROUTES (Admin only)
// =================================================================

// Cập nhật level package (pricing, description, features)
router.put('/:level', authenticateToken, requireAdmin, updateLevelPackage);

// Lấy statistics của tất cả levels
router.get('/admin/stats', authenticateToken, requireAdmin, getLevelPackageStats);

export default router;
