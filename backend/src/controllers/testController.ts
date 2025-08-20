import { Request, Response } from 'express';
import { User } from '../models/User';

// Test endpoint to create a sample user
export const createTestUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@english-learning.com' });
    
    if (existingUser) {
      res.json({
        status: 'success',
        message: 'Test user already exists',
        user: {
          id: existingUser._id,
          email: existingUser.email,
          fullName: existingUser.fullName,
          level: existingUser.level
        }
      });
      return;
    }

    // Create new test user
    const testUser = new User({
      email: 'test@english-learning.com',
      password: 'password123', // In real app, this would be hashed
      fullName: 'Test User',
      level: 'A1',
      learningGoals: ['speaking', 'listening'],
      preferences: {
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        notifications: {
          email: true,
          push: true
        }
      }
    });

    const savedUser = await testUser.save();

    res.status(201).json({
      status: 'success',
      message: 'Test user created successfully',
      user: {
        id: savedUser._id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        level: savedUser.level,
        createdAt: savedUser.createdAt
      }
    });

  } catch (error: any) {
    console.error('❌ Create test user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create test user',
      error: error.message
    });
  }
};

// Get all users (for testing)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, '-password').limit(10);
    
    res.json({
      status: 'success',
      count: users.length,
      users: users
    });
  } catch (error: any) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get users',
      error: error.message
    });
  }
};
