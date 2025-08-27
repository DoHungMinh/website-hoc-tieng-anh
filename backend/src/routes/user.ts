import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { User } from '../models/User';
import {
  getAllUsers,
  getUserById,
  updateAccountStatus,
  updateOnlineStatus,
  deleteUser,
  createUser,
  updateUser,
  getUserStats
} from '../controllers/userController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user statistics (admin only)
router.get('/stats', requireAdmin, getUserStats);

// Get all users with pagination and filters (admin only)
router.get('/', requireAdmin, getAllUsers);

// Get user by ID (admin only)
router.get('/:id', requireAdmin, getUserById);

// Create new user (admin only)
router.post('/', requireAdmin, createUser);

// Update user info (admin only)
router.put('/:id', requireAdmin, updateUser);

// Update account status (admin only)
router.patch('/:id/account-status', requireAdmin, updateAccountStatus);

// Update online status (admin only)
router.patch('/:id/online-status', requireAdmin, updateOnlineStatus);

// Delete user (admin only)
router.delete('/:id', requireAdmin, deleteUser);

// Heartbeat endpoint to update user online status (any authenticated user)
router.post('/heartbeat', async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Update user online status
    await User.findByIdAndUpdate(
      userId,
      {
        isOnline: true,
        lastSeen: new Date()
      },
      { 
        runValidators: false
      }
    );

    res.json({
      success: true,
      message: 'Heartbeat updated'
    });

  } catch (error) {
    console.error('Error updating heartbeat:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

export default router;
