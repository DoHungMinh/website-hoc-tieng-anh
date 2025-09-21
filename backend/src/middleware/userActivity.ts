import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

// Cache to track last update time for each user to prevent excessive DB updates
const userActivityCache = new Map<string, number>();
const ACTIVITY_UPDATE_THRESHOLD = 10000; // Only update if last update was more than 10 seconds ago

// Counter for cache cleanup optimization
let cleanupCounter = 0;
const CACHE_CLEANUP_INTERVAL = 12; // Clean cache every 12 cycles (12 * 5s = 1 minute)

// Middleware to update user online status when they make requests
export const updateUserActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Only update if user is authenticated
        if (req.user && req.user._id) {
            const userId = req.user._id.toString();
            const currentTime = Date.now();
            const lastUpdate = userActivityCache.get(userId) || 0;

            // Only update if enough time has passed since last update
            if (currentTime - lastUpdate > ACTIVITY_UPDATE_THRESHOLD) {
                // Uncomment for debugging: console.log(`Updating activity for user: ${req.user.email}`);

                // Update user's online status and last seen time
                await User.findByIdAndUpdate(
                    req.user._id,
                    {
                        isOnline: true,
                        lastSeen: new Date(),
                    },
                    {
                        new: false, // Don't return the updated document to save bandwidth
                        runValidators: false, // Skip validation for performance
                    }
                );

                // Update cache
                userActivityCache.set(userId, currentTime);
            }
        }
        next();
    } catch (error) {
        // Don't block the request if updating activity fails
        console.error("Error updating user activity:", error);
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
                lastSeen: new Date(),
            },
            { runValidators: false }
        );

        // Remove from cache when user goes offline
        userActivityCache.delete(userId);

        // Trigger immediate cleanup after logout
        await triggerManualCleanup();
    } catch (error) {
        console.error("Error setting user offline:", error);
    }
};

// Function to trigger manual cleanup (called on login/logout)
export const triggerManualCleanup = async () => {
    try {
        console.log(
            "🔄 Manual user activity cleanup triggered (login/logout event)"
        );
        await updateInactiveUsers(true); // Pass true for manual cleanup
    } catch (error) {
        console.error("Error in manual cleanup:", error);
    }
};

// Function to set user online (called on login)
export const setUserOnline = async (userId: string) => {
    try {
        await User.findByIdAndUpdate(
            userId,
            {
                isOnline: true,
                lastSeen: new Date(),
            },
            { runValidators: false }
        );

        // Update cache when user comes online
        userActivityCache.set(userId, Date.now());

        // Trigger immediate cleanup after login
        await triggerManualCleanup();

        console.log(`👤 User ${userId} set online with manual cleanup`);
    } catch (error) {
        console.error("Error setting user online:", error);
    }
};

// Function to set inactive users offline (run periodically)
export const updateInactiveUsers = async (isManual: boolean = false) => {
    try {
        // Set users offline if they haven't been active for more than 2 minutes
        // But exclude admin users to prevent dashboard reload issues
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

        const result = await User.updateMany(
            {
                isOnline: true,
                lastSeen: { $lt: twoMinutesAgo },
                role: { $ne: "admin" }, // Exclude admin users
            },
            {
                isOnline: false,
            },
            { runValidators: false }
        );

        // Increment cleanup counter only for scheduled cleanup
        if (!isManual) {
            cleanupCounter++;
        }

        // Clean up old cache entries only every CACHE_CLEANUP_INTERVAL cycles (every ~1 minute)
        // Or immediately for manual cleanup
        if (isManual || cleanupCounter >= CACHE_CLEANUP_INTERVAL) {
            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            let cleanedCount = 0;

            for (const [userId, lastUpdate] of userActivityCache.entries()) {
                if (lastUpdate < oneHourAgo) {
                    userActivityCache.delete(userId);
                    cleanedCount++;
                }
            }

            if (result.modifiedCount > 0 || cleanedCount > 0) {
                const logPrefix = isManual ? "🔄 Manual" : "🔄 Scheduled";
                console.log(
                    `${logPrefix} user activity cleanup completed - ${result.modifiedCount} users set offline, ${cleanedCount} cache entries cleaned`
                );
            }

            if (!isManual) {
                cleanupCounter = 0; // Reset counter only for scheduled cleanup
            }
        } else if (result.modifiedCount > 0) {
            console.log(
                `🔄 ${result.modifiedCount} inactive users set offline (scheduled)`
            );
        }
    } catch (error) {
        console.error("Error updating inactive users:", error);
    }
};

// Set up periodic cleanup of inactive users (every 30 seconds)
export const startUserActivityCleanup = () => {
    setInterval(updateInactiveUsers, 30 * 1000); // Run every 30 seconds
    console.log("🕐 User activity cleanup started - running every 30 seconds");
};
