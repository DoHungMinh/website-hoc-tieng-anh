import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

// Middleware to update user online status when they make requests
export const updateUserActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only update if user is authenticated
    if (req.user && req.user._id) {
      console.log(`Updating activity for user: ${req.user.email} on ${req.method} ${req.originalUrl}`);
      
      // Update user's online status and last seen time
      await User.findByIdAndUpdate(
        req.user._id,
        {
          isOnline: true,
          lastSeen: new Date()
        },
        { 
          new: false, // Don't return the updated document to save bandwidth
          runValidators: false // Skip validation for performance
        }
      );
    }
    next();
  } catch (error) {
    // Don't block the request if updating activity fails
    console.error('Error updating user activity:', error);
    next();
  }
};

// Middleware to set user offline (called on logout)
export const setUserOffline = async (userId: string) => {
  try {
    await User.findByIdAndUpdate(
      userId,
      {
        isOnline: false,
        lastSeen: new Date()
      },
      { runValidators: false }
    );
  } catch (error) {
    console.error('Error setting user offline:', error);
  }
};

// Function to set inactive users offline (run periodically)
export const updateInactiveUsers = async () => {
  try {
    // Set users offline if they haven't been active for more than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    await User.updateMany(
      {
        isOnline: true,
        lastSeen: { $lt: fiveMinutesAgo }
      },
      {
        isOnline: false
      },
      { runValidators: false }
    );
    
    console.log('Updated inactive users offline status');
  } catch (error) {
    console.error('Error updating inactive users:', error);
  }
};

// Set up periodic cleanup of inactive users (every 2 minutes)
export const startUserActivityCleanup = () => {
  setInterval(updateInactiveUsers, 2 * 60 * 1000); // Run every 2 minutes
  console.log('🕐 User activity cleanup started - running every 2 minutes');
};
