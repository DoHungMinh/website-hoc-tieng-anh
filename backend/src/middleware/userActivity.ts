import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { Progress } from "../models/Progress";

// Cache to track last update time for each user to prevent excessive DB updates
const userActivityCache = new Map<string, number>();
const ACTIVITY_UPDATE_THRESHOLD = 10000; // Only update if last update was more than 10 seconds ago

// Cache to track user online session start time
const userOnlineSessionCache = new Map<string, number>();

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

        // Calculate online session time and update weekly activity
        const sessionStartTime = userOnlineSessionCache.get(userId);
        if (sessionStartTime) {
            const sessionEndTime = Date.now();
            const sessionDurationMinutes = Math.round(
                (sessionEndTime - sessionStartTime) / (1000 * 60)
            );
            const sessionDurationHours = sessionDurationMinutes / 60;

            // Update weekly online time if session was significant (> 1 minute)
            if (sessionDurationMinutes > 1) {
                await updateWeeklyOnlineTime(userId, sessionDurationHours);
                console.log(
                    `📊 Recorded ${sessionDurationMinutes} minutes of online time for user ${userId}`
                );
            }

            // Remove from session cache
            userOnlineSessionCache.delete(userId);
        }

        // Remove from cache when user goes offline
        userActivityCache.delete(userId);

        // Trigger immediate cleanup after logout
        await triggerManualCleanup();

        console.log(`👤 User ${userId} set offline with session time recorded`);
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

        // Record session start time for online time tracking
        userOnlineSessionCache.set(userId, Date.now());

        // Trigger immediate cleanup after login
        await triggerManualCleanup();

        console.log(`👤 User ${userId} set online with manual cleanup`);
    } catch (error) {
        console.error("Error setting user online:", error);
    }
};

// Helper function to get week number (ISO week)
const getWeekNumber = (date: Date): number => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};

// Function to update weekly online time
const updateWeeklyOnlineTime = async (
    userId: string,
    onlineTimeHours: number
) => {
    try {
        const progress = await Progress.findOne({ userId });
        if (!progress) return;

        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Map to correct day names matching progress controller order (T2-CN)
        const dayNames = [
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
            "Chủ nhật",
        ];
        // Convert JavaScript day (0=Sunday, 1=Monday) to our index (0=Monday, 6=Sunday)
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const currentDay = dayNames[dayIndex];

        // Get current week (ISO format)
        const year = today.getFullYear();
        const week = getWeekNumber(today);
        const weekString = `${year}-W${week.toString().padStart(2, "0")}`;

        // Find or create current week activity
        let currentWeek = progress.weeklyActivity.find(
            (w) => w.week === weekString
        );

        if (!currentWeek) {
            currentWeek = {
                week: weekString,
                days: dayNames.map((day) => ({
                    day,
                    hours: 0,
                    activities: [],
                })),
                totalHours: 0,
            };
            progress.weeklyActivity.push(currentWeek);
        }

        // Update current day online time
        const currentDayActivity = currentWeek.days.find(
            (d) => d.day === currentDay
        );
        if (currentDayActivity) {
            currentDayActivity.hours += onlineTimeHours;

            // Add online activity if significant time (> 5 minutes)
            if (onlineTimeHours > 0.08) {
                // 5 minutes = 0.08 hours
                const onlineMinutes = Math.round(onlineTimeHours * 60);
                const onlineActivityString = `Hoạt động online ${onlineMinutes} phút`;

                // Check if we already have an online activity for today
                const hasOnlineActivity = currentDayActivity.activities.some(
                    (activity) => activity.includes("Hoạt động online")
                );

                if (!hasOnlineActivity) {
                    currentDayActivity.activities.push(onlineActivityString);
                }
            }
        }

        // Update total hours for the week
        currentWeek.totalHours = currentWeek.days.reduce(
            (sum, day) => sum + day.hours,
            0
        );

        await progress.save();
    } catch (error) {
        console.error("Error updating weekly online time:", error);
    }
}; // Function to set inactive users offline (run periodically)
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
