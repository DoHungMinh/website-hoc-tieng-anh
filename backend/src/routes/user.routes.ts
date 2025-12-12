import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import {
    authenticateToken,
    requireAdmin,
} from "../middleware/auth";
import {
    getAllUsers,
    getUserById,
    updateAccountStatus,
    updateOnlineStatus,
    deleteUser,
    createUser,
    updateUser,
    getUserStats,
    uploadAvatar,
    deleteAvatar,
} from "../controllers/userController";
import { upload as avatarUpload } from "../services/imageUploadService";
import { realtimeService } from "../services/realtimeService";

const router = Router();

// =================================================================
// CACHE FOR OPTIMIZATION
// =================================================================

// Cache for heartbeat to reduce database load
const heartbeatCache = new Map<string, number>();
const HEARTBEAT_CACHE_DURATION = 60000; // 60 seconds

// =================================================================
// USER PROFILE ROUTES (Authenticated User)
// =================================================================

// Get user profile endpoint (any authenticated user can get their own profile)
router.get(
    "/profile",
    authenticateToken,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?._id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
                return;
            }

            const user = await User.findById(userId).select("-password");

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng",
                });
                return;
            }

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            console.error("Get user profile error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin người dùng",
            });
        }
    }
);

// Heartbeat endpoint to update user online status
router.post(
    "/heartbeat",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            const userId = req.user?._id;
            const userEmail = req.user?.email;
            const accountStatus = req.user?.accountStatus;

            if (!userId) {
                console.log("❌ HEARTBEAT: No user ID found");
                res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
                return;
            }

            // Check if account is disabled
            if (accountStatus === "disabled") {
                console.log(
                    `🚫 HEARTBEAT: Account disabled for user ${userEmail}`
                );
                res.status(403).json({
                    success: false,
                    message:
                        "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ admin.",
                });
                return;
            }

            const userIdStr = userId.toString();
            const now = Date.now();
            const lastUpdate = heartbeatCache.get(userIdStr) || 0;

            // Only update database if enough time has passed
            if (now - lastUpdate > HEARTBEAT_CACHE_DURATION) {
                // Update user online status in background (don't wait for it)
                User.findByIdAndUpdate(
                    userId,
                    {
                        isOnline: true,
                        lastSeen: new Date(),
                    },
                    {
                        runValidators: false,
                        new: false,
                    }
                ).catch((error) => {
                    console.error(
                        "Error updating heartbeat in background:",
                        error
                    );
                });

                heartbeatCache.set(userIdStr, now);
            }

            res.json({
                success: true,
                message: "Heartbeat received",
                cached: now - lastUpdate <= HEARTBEAT_CACHE_DURATION,
            });
        } catch (error) {
            console.error("Error processing heartbeat:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server",
            });
        }
    }
);

// Offline endpoint to set user offline when closing tab/browser
router.post("/offline", async (req: Request, res: Response) => {
    try {
        // For offline endpoint, we need to manually check token from body
        const token = req.body.token;

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Token required",
            });
            return;
        }

        // Manually verify the token
        let decoded: any;
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "vti-secret-key"
            );
        } catch (error) {
            res.status(401).json({
                success: false,
                message: "Invalid token",
            });
            return;
        }

        const userId = decoded.userId;
        const userEmail = decoded.email;

        console.log(`👋 OFFLINE: User ${userEmail} (${userId}) closing tab`);

        // Set user offline immediately
        await User.findByIdAndUpdate(
            userId,
            {
                isOnline: false,
                lastSeen: new Date(),
            },
            {
                runValidators: false,
                new: false,
            }
        );

        // Broadcast updated statistics
        await realtimeService.broadcastUpdatedStats();

        // Remove from heartbeat cache
        heartbeatCache.delete(userId.toString());

        res.json({
            success: true,
            message: "User set offline",
        });
    } catch (error) {
        console.error("Error setting user offline:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
});

// Change password endpoint
router.put(
    "/change-password",
    authenticateToken,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?._id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                res.status(400).json({
                    success: false,
                    message:
                        "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới",
                });
                return;
            }

            if (newPassword.length < 6) {
                res.status(400).json({
                    success: false,
                    message: "Mật khẩu mới phải có ít nhất 6 ký tự",
                });
                return;
            }

            // Find user with password field
            const user = await User.findById(userId).select("+password");
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng",
                });
                return;
            }

            // Verify current password
            const isValidPassword = await user.comparePassword(currentPassword);
            if (!isValidPassword) {
                res.status(400).json({
                    success: false,
                    message: "Mật khẩu hiện tại không đúng",
                });
                return;
            }

            // Update password
            user.password = newPassword;
            await user.save();

            res.json({
                success: true,
                message: "Đổi mật khẩu thành công",
            });
        } catch (error) {
            console.error("Error changing password:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server",
            });
        }
    }
);

// Upload avatar
router.post(
    "/:userId/avatar",
    authenticateToken,
    avatarUpload.single("avatar"),
    uploadAvatar
);

// Delete avatar
router.delete("/:userId/avatar", authenticateToken, deleteAvatar);

// =================================================================
// ADMIN ROUTES
// =================================================================

// IMPORTANT: Specific routes MUST come before dynamic routes (/:id)

// Get user statistics (admin only)
router.get("/stats", authenticateToken, requireAdmin, getUserStats);

// Get all users with pagination and filters (admin only)
router.get("/", authenticateToken, requireAdmin, getAllUsers);

// Get user by ID (admin only) - MUST be after /stats
router.get("/:id", authenticateToken, requireAdmin, getUserById);

// Create new user (admin only)
router.post("/", authenticateToken, requireAdmin, createUser);

// Update user info (admin only)
router.put("/:id", authenticateToken, requireAdmin, updateUser);

// Update account status (admin only)
router.patch(
    "/:id/account-status",
    authenticateToken,
    requireAdmin,
    updateAccountStatus
);

// Update online status (admin only)
router.patch(
    "/:id/online-status",
    authenticateToken,
    requireAdmin,
    updateOnlineStatus
);

// Delete user (admin only)
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

export default router;
