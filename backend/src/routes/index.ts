import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import express from "express";

// Import models
import { User } from "../models/User";
import Course from "../models/Course";
import { IELTSExam } from "../models/IELTSExam";
import IELTSTestResult from "../models/IELTSTestResult";
import Enrollment from "../models/Enrollment";

// Import utilities
import { calculateUserLevel } from "../utils/levelCalculator";

// Import controllers
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
import {
    getCourses,
    getPublicCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    updateCourseStatus,
    getCourseStats,
    handlePayOSPaymentSuccess,
} from "../controllers/courseController";
import {
    getIELTSExams,
    getIELTSExamById,
    createIELTSExam,
    updateIELTSExam,
    deleteIELTSExam,
    toggleExamStatus,
    uploadAudio,
    getExamStats,
    submitTestResult,
    getUserTestHistory,
    getTestResultDetail,
    upload,
} from "../controllers/ieltsController";
import {
    enrollInCourse,
    getUserEnrollments,
} from "../controllers/enrollmentController";
import {
    getUserEnrollments as getSimpleUserEnrollments,
    enrollInCourse as simpleEnrollInCourse,
} from "../controllers/simpleEnrollmentController";
import { simpleChatbotController } from "../controllers/simpleChatbotController";
import { realDataChatbotController } from "../controllers/realDataChatbotController";
import {
    generateCourse,
    getTopicSuggestions,
} from "../controllers/aiCourseController";
import {
    generateIELTSReading,
    getIELTSTopicSuggestions,
    validateIELTSContent,
} from "../controllers/aiIELTSController";
import {
    initializeProgress,
    getUserProgress,
    getWeeklyActivity,
    updateVocabularyProgress,
    updateListeningProgress,
    updateTestProgress,
} from "../controllers/progressController";

// Import middleware
import {
    authenticateToken,
    requireAdmin,
    requireAuth,
    optionalAuth,
} from "../middleware/auth";
import { setUserOffline, setUserOnline } from "../middleware/userActivity";
import { realtimeService } from "../services/realtimeService";

const router = Router();

// =================================================================
// AUTH ROUTES (/api/auth)
// =================================================================

// Generate JWT token
const generateToken = (userId: string): string => {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const expiresIn = process.env.JWT_EXPIRE || "30d";

    return jwt.sign(
        { userId },
        secret as string,
        { expiresIn } as jwt.SignOptions
    );
};

// Register
router.post("/auth/register", async (req: Request, res: Response) => {
    try {
        const { fullName, email, phone, password } = req.body;

        // Validation
        if (!fullName || !email || !password) {
            res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin bắt buộc",
            });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: "Mật khẩu phải có ít nhất 6 ký tự",
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "Email này đã được sử dụng",
            });
            return;
        }

        // Create new user
        const user = new User({
            fullName,
            email,
            phone,
            password,
            role: "user", // Force user role for registration
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                bio: user.bio,
                birthDate: user.birthDate,
                learningGoal: user.learningGoal,
                level: user.level,
                avatar: user.avatar,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng ký",
        });
    }
});

// Login
router.post("/auth/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mật khẩu",
            });
            return;
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng",
            });
            return;
        }

        // Check if account is disabled
        if (user.accountStatus === "disabled") {
            res.status(403).json({
                success: false,
                message: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ admin.",
            });
            return;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng",
            });
            return;
        }

        // Update user online status with manual cleanup
        await setUserOnline(user._id.toString());

        // Generate token
        const token = generateToken(user._id);

        // Broadcast updated statistics when user logs in (for user count updates)
        await realtimeService.broadcastUpdatedStats();

        res.json({
            success: true,
            message:
                user.role === "admin"
                    ? "Đăng nhập admin thành công"
                    : "Đăng nhập thành công",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                bio: user.bio,
                birthDate: user.birthDate,
                learningGoal: user.learningGoal,
                level: user.level,
                avatar: user.avatar,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng nhập",
        });
    }
});

// Logout
router.post(
    "/auth/logout",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            if (req.user && req.user._id) {
                // Set user offline
                await setUserOffline(req.user._id);
                // Broadcast updated statistics when user logs out (for user count updates)
                await realtimeService.broadcastUpdatedStats();
            }

            res.json({
                success: true,
                message: "Đăng xuất thành công",
            });
        } catch (error) {
            console.error("Logout error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi đăng xuất",
            });
        }
    }
);

// Auth test route
router.get("/auth/test", (req, res) => {
    res.json({ message: "Auth routes working" });
});

// =================================================================
// USER ROUTES (/api/user)
// =================================================================

// Cache for heartbeat to reduce database load
const heartbeatCache = new Map<string, number>();
const HEARTBEAT_CACHE_DURATION = 60000; // 60 seconds

// Get user profile endpoint (any authenticated user can get their own profile)
router.get(
    "/user/profile",
    authenticateToken,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?._id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Không tìm thấy thông tin người dùng",
                });
                return;
            }

            // Find user
            const user = await User.findById(userId).select("-password");
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng",
                });
                return;
            }

            // Get latest test results to calculate current level
            const testResults = await IELTSTestResult.find({ userId }).lean();
            let currentLevel = user.level;
            let levelSource = "default";

            // Only update level if there are test results with valid band scores
            const validTestResults = testResults.filter(
                (result: any) => result.score?.bandScore > 0
            );
            if (validTestResults.length > 0) {
                const calculatedLevel = calculateUserLevel(
                    validTestResults.map((result: any) => ({
                        bandScore: result.score?.bandScore,
                    }))
                );
                currentLevel = calculatedLevel;
                levelSource = "test_results";

                // Update user level if it's different from calculated level
                if (calculatedLevel !== user.level) {
                    user.level = calculatedLevel;
                    await user.save({ validateModifiedOnly: true });
                }
            }

            // Prepare response data
            const responseData: any = {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                bio: user.bio,
                birthDate: user.birthDate,
                learningGoal: user.learningGoal,
                avatar: user.avatar,
                role: user.role,
                levelSource: levelSource,
            };

            // Only include level if there are valid test results
            if (levelSource === "test_results") {
                responseData.level = currentLevel;
            }

            res.json({
                success: true,
                data: responseData,
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

// Update profile endpoint (any authenticated user can update their own profile)
router.put(
    "/user/profile",
    authenticateToken,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?._id;
            const { fullName, phone, bio, birthDate, learningGoal, level } =
                req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Không tìm thấy thông tin người dùng",
                });
                return;
            }

            // Find user
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng",
                });
                return;
            }

            // Update user info (level is auto-calculated from test results, so ignore level updates)
            if (fullName !== undefined) user.fullName = fullName;
            if (phone !== undefined) user.phone = phone;
            if (bio !== undefined) user.bio = bio;
            if (birthDate !== undefined) user.birthDate = birthDate;
            if (learningGoal !== undefined) user.learningGoal = learningGoal;
            // Note: level is automatically managed based on test results

            await user.save({ validateModifiedOnly: true });

            res.json({
                success: true,
                message: "Cập nhật thông tin thành công",
                data: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    bio: user.bio,
                    birthDate: user.birthDate,
                    learningGoal: user.learningGoal,
                    level: user.level,
                    avatar: user.avatar,
                    role: user.role,
                },
            });
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi cập nhật thông tin",
            });
        }
    }
);

// Get user statistics (admin only)
router.get("/user/stats", authenticateToken, requireAdmin, getUserStats);

// Get all users with pagination and filters (admin only)
router.get("/user", authenticateToken, requireAdmin, getAllUsers);

// Get user by ID (admin only)
router.get("/user/:id", authenticateToken, requireAdmin, getUserById);

// Create new user (admin only)
router.post("/user", authenticateToken, requireAdmin, createUser);

// Update user info (admin only)
router.put("/user/:id", authenticateToken, requireAdmin, updateUser);

// Update account status (admin only)
router.patch(
    "/user/:id/account-status",
    authenticateToken,
    requireAdmin,
    updateAccountStatus
);

// Update online status (admin only)
router.patch(
    "/user/:id/online-status",
    authenticateToken,
    requireAdmin,
    updateOnlineStatus
);

// Delete user (admin only)
router.delete("/user/:id", authenticateToken, requireAdmin, deleteUser);

// Upload avatar (authenticated user can upload their own avatar)
router.post(
    "/user/:userId/avatar",
    authenticateToken,
    avatarUpload.single("avatar"),
    uploadAvatar
);

// Delete avatar (authenticated user can delete their own avatar)
router.delete("/user/:userId/avatar", authenticateToken, deleteAvatar);

// Heartbeat endpoint to update user online status (any authenticated user)
router.post(
    "/user/heartbeat",
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
                        new: false, // Don't return the document to save bandwidth
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
router.post("/user/offline", async (req: Request, res: Response) => {
    try {
        // For offline endpoint, we need to manually check token from body since sendBeacon can't send headers
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

        // Broadcast updated statistics when user goes offline (for user count updates)
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

// Change password endpoint (any authenticated user can change their own password)
router.put(
    "/user/change-password",
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

// =================================================================
// COURSES ROUTES (/api/courses)
// =================================================================

// Public routes
router.get("/courses/public", getPublicCourses);
router.get("/courses/public/:id", getCourseById);

// Enrollment route (authenticated users)
router.post(
    "/courses/:id/enroll",
    authenticateToken,
    async (req: express.Request, res: express.Response) => {
        try {
            res.json({
                success: true,
                message: "Enrollment successful",
                data: {
                    courseId: req.params.id,
                    userId: req.user?._id,
                    enrolledAt: new Date(),
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Enrollment failed",
            });
        }
    }
);

// Get user enrollments (authenticated users)
router.get("/courses/enrollments", authenticateToken, getUserEnrollments);

// Admin routes
router.get("/courses", authenticateToken, requireAdmin, getCourses);
router.get("/courses/stats", authenticateToken, requireAdmin, getCourseStats);
router.get("/courses/:id", authenticateToken, requireAdmin, getCourseById);
router.post("/courses", authenticateToken, requireAdmin, createCourse);
router.put("/courses/:id", authenticateToken, requireAdmin, updateCourse);
router.patch(
    "/courses/:id/status",
    authenticateToken,
    requireAdmin,
    updateCourseStatus
);
router.delete("/courses/:id", authenticateToken, requireAdmin, deleteCourse);

// PayOS payment success route
router.post(
    "/courses/payos-payment-success",
    authenticateToken,
    handlePayOSPaymentSuccess
);

// =================================================================
// PAYMENT HISTORY ROUTES (/api/payments)
// =================================================================

// Get payment history for admin
router.get(
    "/payments/history",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");
            const {
                status,
                startDate,
                endDate,
                page = 1,
                limit = 20,
            } = req.query;

            // Build filter
            const filter: any = {};
            if (status && status !== "all") filter.status = status;
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate)
                    filter.createdAt.$gte = new Date(startDate as string);
                if (endDate)
                    filter.createdAt.$lte = new Date(endDate as string);
            }

            // Pagination
            const skip = (Number(page) - 1) * Number(limit);

            // Get payments with populated data
            const payments = await PaymentHistory.find(filter)
                .populate("courseId", "title type level price")
                .populate("userId", "fullName email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit));

            const total = await PaymentHistory.countDocuments(filter);
            const stats = await PaymentHistory.getPaymentStats();

            res.json({
                success: true,
                data: {
                    payments,
                    pagination: {
                        current: Number(page),
                        pages: Math.ceil(total / Number(limit)),
                        total,
                    },
                    statistics: stats,
                },
            });
        } catch (error: any) {
            console.error("❌ Get payment history error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy lịch sử thanh toán",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// Get payment statistics for admin dashboard
router.get(
    "/payments/stats",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");
            const stats = await PaymentHistory.getPaymentStats();
            const recentPayments = await PaymentHistory.getRecentPayments(5);

            res.json({
                success: true,
                data: {
                    overall: stats,
                    recent: recentPayments,
                },
            });
        } catch (error: any) {
            console.error("❌ Get payment stats error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê thanh toán",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// Get today's payment statistics
router.get(
    "/payments/stats/today",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");

            // Get start and end of today in Vietnam timezone
            const today = new Date();
            const startOfDay = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );
            const endOfDay = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + 1
            );

            // Today's revenue (only PAID transactions)
            const todayRevenue = await PaymentHistory.aggregate([
                {
                    $match: {
                        status: "PAID",
                        paidAt: {
                            $gte: startOfDay,
                            $lt: endOfDay,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$amount" },
                    },
                },
            ]);

            // Today's transaction count
            const todayTransactions = await PaymentHistory.countDocuments({
                createdAt: {
                    $gte: startOfDay,
                    $lt: endOfDay,
                },
            });

            res.json({
                success: true,
                data: {
                    todayRevenue: todayRevenue[0]?.totalRevenue || 0,
                    todayTransactions: todayTransactions,
                },
            });
        } catch (error: any) {
            console.error("❌ Get today's payment stats error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê thanh toán hôm nay",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// Get this month's payment statistics
router.get(
    "/payments/stats/month",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");

            // Get start and end of current month
            const today = new Date();
            const startOfMonth = new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );
            const endOfMonth = new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                1
            );

            // This month's revenue (only PAID transactions)
            const monthRevenue = await PaymentHistory.aggregate([
                {
                    $match: {
                        status: "PAID",
                        paidAt: {
                            $gte: startOfMonth,
                            $lt: endOfMonth,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$amount" },
                    },
                },
            ]);

            res.json({
                success: true,
                data: {
                    monthRevenue: monthRevenue[0]?.totalRevenue || 0,
                },
            });
        } catch (error: any) {
            console.error("❌ Get month's payment stats error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê thanh toán tháng này",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// Get payment success rate statistics
router.get(
    "/payments/stats/success-rate",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");

            // Get total transactions count
            const totalTransactions = await PaymentHistory.countDocuments({});

            // Get successful transactions count (PAID status)
            const successfulTransactions = await PaymentHistory.countDocuments({
                status: "PAID",
            });

            // Calculate success rate as percentage
            const successRate =
                totalTransactions > 0
                    ? Math.round(
                          (successfulTransactions / totalTransactions) *
                              100 *
                              10
                      ) / 10 // Round to 1 decimal
                    : 0;

            res.json({
                success: true,
                data: {
                    successRate: successRate,
                    totalTransactions: totalTransactions,
                    successfulTransactions: successfulTransactions,
                },
            });
        } catch (error: any) {
            console.error("❌ Get payment success rate error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy tỷ lệ thành công thanh toán",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// =================================================================
// AI COURSE GENERATION ROUTES (/api/ai)
// =================================================================

// Generate course using AI
router.post(
    "/ai/generate-course",
    authenticateToken,
    requireAdmin,
    generateCourse
);

// Get topic suggestions for course generation
router.get(
    "/ai/topic-suggestions",
    authenticateToken,
    requireAdmin,
    getTopicSuggestions
);

// Generate IELTS Reading test using AI
router.post(
    "/ai/generate-ielts-reading",
    authenticateToken,
    requireAdmin,
    generateIELTSReading
);

// Get topic suggestions for IELTS Reading
router.get(
    "/ai/ielts-topic-suggestions",
    authenticateToken,
    requireAdmin,
    getIELTSTopicSuggestions
);

// Validate IELTS content
router.post(
    "/ai/validate-ielts",
    authenticateToken,
    requireAdmin,
    validateIELTSContent
);

// =================================================================
// IELTS ROUTES (/api/ielts)
// =================================================================

// Public routes (for students to access published exams)
router.get("/ielts", getIELTSExams);
router.get("/ielts/:id", getIELTSExamById);

// Admin routes (require authentication and admin role)
router.post("/ielts", authenticateToken, requireAdmin, createIELTSExam);
router.put("/ielts/:id", authenticateToken, requireAdmin, updateIELTSExam);
router.patch(
    "/ielts/:id/status",
    authenticateToken,
    requireAdmin,
    toggleExamStatus
);
router.delete("/ielts/:id", authenticateToken, requireAdmin, deleteIELTSExam);

// Audio upload route
router.post(
    "/ielts/upload-audio",
    authenticateToken,
    requireAdmin,
    upload.single("audio"),
    uploadAudio
);

// Statistics route
router.get("/ielts/admin/stats", authenticateToken, requireAdmin, getExamStats);

// Test result routes (for students)
router.post("/ielts/:examId/submit", authenticateToken, submitTestResult);
router.get("/ielts/results/history", authenticateToken, getUserTestHistory);
router.get("/ielts/results/:resultId", authenticateToken, getTestResultDetail);

// =================================================================
// CHATBOT ROUTES (/api/chatbot)
// =================================================================

// ===== PUBLIC ENDPOINTS (Simple Mock Data - No Authentication) =====
router.post("/chatbot/simple/message", simpleChatbotController.sendMessage);
router.post(
    "/chatbot/simple/analysis",
    simpleChatbotController.generateProgressAnalysis
);
router.post(
    "/chatbot/simple/recommendations",
    simpleChatbotController.generateLearningRecommendations
);

// Chatbot test endpoint
router.get("/chatbot/test", (req, res) => {
    res.json({
        message: "Chatbot API is working!",
        endpoints: {
            simple: "No auth required - Mock data",
            realData: "Auth required - Real MongoDB data",
        },
        user: "guest",
        timestamp: new Date().toISOString(),
    });
});

// ===== PROTECTED ENDPOINTS (Real Data - Authentication Required) =====
// Real data endpoints - require login and real user data
router.post(
    "/chatbot/message",
    authenticateToken,
    realDataChatbotController.sendMessage
);
router.post(
    "/chatbot/analysis",
    authenticateToken,
    realDataChatbotController.generateProgressAnalysis
);
router.post(
    "/chatbot/recommendations",
    authenticateToken,
    realDataChatbotController.generateLearningRecommendations
);

// User data management endpoints (sử dụng realData controller cho authenticated users)
router.get(
    "/chatbot/history",
    authenticateToken,
    realDataChatbotController.getChatHistory
);
router.get(
    "/chatbot/session/:sessionId",
    authenticateToken,
    realDataChatbotController.getChatSession
);
router.delete(
    "/chatbot/history",
    authenticateToken,
    realDataChatbotController.clearChatHistory
);

// =================================================================
// ENROLLMENT ROUTES (/api/enrollment)
// =================================================================

// Enroll in a course
router.post("/enrollment", authenticateToken, enrollInCourse);

// Get user enrollments
router.get("/enrollment", authenticateToken, getUserEnrollments);

// Simple enrollment routes
router.get("/enrollment/simple", authenticateToken, getSimpleUserEnrollments);
router.post("/enrollment/simple", authenticateToken, simpleEnrollInCourse);

// =================================================================
// PROGRESS ROUTES (/api/progress)
// =================================================================

// Initialize progress for new user
router.post("/progress/initialize", requireAuth, initializeProgress);

// Get user progress
router.get("/progress", requireAuth, getUserProgress);

// Get weekly activity
router.get("/progress/weekly-activity", requireAuth, getWeeklyActivity);

// Update vocabulary progress
router.post("/progress/vocabulary", requireAuth, updateVocabularyProgress);

// Update listening progress
router.post("/progress/listening", requireAuth, updateListeningProgress);

// Update test progress
router.post("/progress/test", requireAuth, updateTestProgress);

// =================================================================
// ASSESSMENT ROUTES (/api/assessment)
// =================================================================

// Assessment routes will be implemented here
router.get("/assessment/test", (req, res) => {
    res.json({ message: "Assessment routes working" });
});

// =================================================================
// LEARNING ROUTES (/api/learning)
// =================================================================

// Learning routes will be implemented here
router.get("/learning/test", (req, res) => {
    res.json({ message: "Learning routes working" });
});

// =================================================================
// ADMIN STATISTICS ROUTES (/api/admin/statistics)
// =================================================================

// Helper function để tính thời gian tương đối
function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return "Vừa xong";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
    } else {
        return new Date(date).toLocaleDateString("vi-VN");
    }
}

// GET /api/admin/statistics/overview - Thống kê tổng quan như trong giao diện
router.get(
    "/admin/statistics/overview",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            // Tổng người dùng
            const totalUsers = await User.countDocuments();

            // Tính người dùng mới trong tháng hiện tại
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);

            const newUsersThisMonth = await User.countDocuments({
                createdAt: { $gte: currentMonth },
            });

            // Tính người dùng mới trong tháng trước
            const previousMonth = new Date(currentMonth);
            previousMonth.setMonth(previousMonth.getMonth() - 1);

            const newUsersPreviousMonth = await User.countDocuments({
                createdAt: {
                    $gte: previousMonth,
                    $lt: currentMonth,
                },
            });

            // Tính tỷ lệ tăng trưởng
            let userGrowthRate = 0;
            if (newUsersPreviousMonth > 0) {
                userGrowthRate = Math.round(
                    ((newUsersThisMonth - newUsersPreviousMonth) /
                        newUsersPreviousMonth) *
                        100
                );
            } else if (newUsersThisMonth > 0) {
                userGrowthRate = 100;
            }

            // Tổng số khóa học (real data from Course model)
            const totalCourses = await Course.countDocuments();

            // Tính số khóa học tạo trong tháng hiện tại
            const newCoursesThisMonth = await Course.countDocuments({
                createdAt: { $gte: currentMonth },
            });

            // Tính số khóa học tạo trong tháng trước
            const newCoursesPreviousMonth = await Course.countDocuments({
                createdAt: {
                    $gte: previousMonth,
                    $lt: currentMonth,
                },
            });

            // Tính tỷ lệ tăng trưởng khóa học
            let courseGrowthRate = 0;
            if (newCoursesPreviousMonth > 0) {
                courseGrowthRate = Math.round(
                    ((newCoursesThisMonth - newCoursesPreviousMonth) /
                        newCoursesPreviousMonth) *
                        100
                );
            } else if (newCoursesThisMonth > 0) {
                courseGrowthRate = 100;
            }

            // Tổng số đề thi (real data from IELTSExam model)
            const totalExams = await IELTSExam.countDocuments();

            // Tính số đề thi tạo trong tháng hiện tại
            const newExamsThisMonth = await IELTSExam.countDocuments({
                createdAt: { $gte: currentMonth },
            });

            // Tính số đề thi tạo trong tháng trước
            const newExamsPreviousMonth = await IELTSExam.countDocuments({
                createdAt: {
                    $gte: previousMonth,
                    $lt: currentMonth,
                },
            });

            // Tính tỷ lệ tăng trưởng đề thi
            let examGrowthRate = 0;
            if (newExamsPreviousMonth > 0) {
                examGrowthRate = Math.round(
                    ((newExamsThisMonth - newExamsPreviousMonth) /
                        newExamsPreviousMonth) *
                        100
                );
            } else if (newExamsThisMonth > 0) {
                examGrowthRate = 100;
            }

            // Doanh thu thực tế từ enrollments và course prices
            // Tháng này (từ đầu tháng đến cuối tháng)
            const thisMonthStart = new Date(currentMonth);
            const nextMonthStart = new Date(currentMonth);
            nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

            const previousMonthStart = new Date(previousMonth);

            const thisMonthEnrollments = await Enrollment.find({
                enrolledAt: { $gte: thisMonthStart, $lt: nextMonthStart },
            }).populate("courseId");

            const previousMonthEnrollments = await Enrollment.find({
                enrolledAt: { $gte: previousMonthStart, $lt: thisMonthStart },
            }).populate("courseId");

            // Tính doanh thu tháng này
            let monthlyRevenue = 0;
            for (const enrollment of thisMonthEnrollments) {
                if (enrollment.courseId && (enrollment.courseId as any).price) {
                    monthlyRevenue += (enrollment.courseId as any).price;
                }
            }

            // Tính doanh thu tháng trước
            let previousMonthRevenue = 0;
            for (const enrollment of previousMonthEnrollments) {
                if (enrollment.courseId && (enrollment.courseId as any).price) {
                    previousMonthRevenue += (enrollment.courseId as any).price;
                }
            }

            // Tính tỷ lệ tăng trưởng doanh thu
            let revenueGrowthRate = 0;
            if (previousMonthRevenue > 0) {
                revenueGrowthRate = Math.round(
                    ((monthlyRevenue - previousMonthRevenue) /
                        previousMonthRevenue) *
                        100
                );
            } else if (monthlyRevenue > 0) {
                revenueGrowthRate = 100;
            }

            // Người dùng hoạt động (đăng nhập trong 30 ngày qua)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const activeUsers = await User.countDocuments({
                lastSeen: { $gte: thirtyDaysAgo },
            });

            const activeUserGrowthRate = 5; // Mock rate

            // Tỷ lệ hoàn thành (mock data)
            const completionRate = 87;
            const completionGrowthRate = 2;

            res.json({
                success: true,
                data: {
                    totalUsers: {
                        value: totalUsers,
                        growth: userGrowthRate,
                        display: totalUsers.toLocaleString(),
                    },
                    activeCourses: {
                        value: totalCourses,
                        growth: courseGrowthRate,
                        display: totalCourses.toString(),
                    },
                    totalExams: {
                        value: totalExams,
                        growth: examGrowthRate,
                        display: totalExams.toString(),
                    },
                    monthlyRevenue: {
                        value: monthlyRevenue,
                        growth: revenueGrowthRate,
                        display: `${Math.round(monthlyRevenue / 1000000)}M VNĐ`,
                    },
                    activeUsers: {
                        value: activeUsers,
                        growth: activeUserGrowthRate,
                        display: activeUsers.toLocaleString(),
                    },
                    completionRate: {
                        value: completionRate,
                        growth: completionGrowthRate,
                        display: `${completionRate}%`,
                    },
                },
            });
        } catch (error) {
            console.error("Error fetching overview statistics:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê tổng quan",
            });
        }
    }
);

// GET /api/admin/statistics/users - Thống kê người dùng chi tiết
router.get(
    "/admin/statistics/users",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const totalUsers = await User.countDocuments();

            // Thống kê theo tháng (12 tháng gần nhất)
            const monthlyStats = [];
            for (let i = 11; i >= 0; i--) {
                const monthStart = new Date();
                monthStart.setMonth(monthStart.getMonth() - i);
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);

                const monthEnd = new Date(monthStart);
                monthEnd.setMonth(monthEnd.getMonth() + 1);

                const monthlyCount = await User.countDocuments({
                    createdAt: {
                        $gte: monthStart,
                        $lt: monthEnd,
                    },
                });

                monthlyStats.push({
                    month: monthStart.toLocaleDateString("vi-VN", {
                        month: "short",
                        year: "numeric",
                    }),
                    count: monthlyCount,
                    timestamp: monthStart.getTime(),
                });
            }

            // Phân bố theo vai trò
            const usersByRole = await User.aggregate([
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: 1 },
                    },
                },
            ]);

            // Phân bố theo trình độ
            const usersByLevel = await User.aggregate([
                {
                    $group: {
                        _id: "$level",
                        count: { $sum: 1 },
                    },
                },
            ]);

            // Phân bố theo trạng thái
            const usersByStatus = await User.aggregate([
                {
                    $group: {
                        _id: "$accountStatus",
                        count: { $sum: 1 },
                    },
                },
            ]);

            res.json({
                success: true,
                data: {
                    totalUsers,
                    monthlyStats,
                    usersByRole: usersByRole.reduce((acc, curr) => {
                        acc[curr._id] = curr.count;
                        return acc;
                    }, {} as Record<string, number>),
                    usersByLevel: usersByLevel.reduce((acc, curr) => {
                        acc[curr._id] = curr.count;
                        return acc;
                    }, {} as Record<string, number>),
                    usersByStatus: usersByStatus.reduce((acc, curr) => {
                        acc[curr._id] = curr.count;
                        return acc;
                    }, {} as Record<string, number>),
                },
            });
        } catch (error) {
            console.error("Error fetching user statistics:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê người dùng",
            });
        }
    }
);

// GET /api/admin/statistics/realtime - Thống kê real-time
router.get(
    "/admin/statistics/realtime",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const now = new Date();

            // Người dùng online hiện tại (isOnline = true)
            const onlineUsers = await User.countDocuments({
                isOnline: true,
            });

            // Người dùng truy cập trong 5 phút qua
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            const recentVisitors = await User.countDocuments({
                lastSeen: { $gte: fiveMinutesAgo },
            });

            // Người dùng truy cập trong 1 giờ qua
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const visitorsLastHour = await User.countDocuments({
                lastSeen: { $gte: oneHourAgo },
            });

            // Người dùng truy cập trong ngày hôm nay
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const visitorsToday = await User.countDocuments({
                lastSeen: { $gte: startOfDay },
            });

            res.json({
                success: true,
                data: {
                    onlineUsers,
                    recentVisitors, // 5 phút qua
                    visitorsLastHour, // 1 giờ qua
                    visitorsToday, // hôm nay
                    timestamp: now.toISOString(),
                },
            });
        } catch (error) {
            console.error("Error fetching realtime statistics:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê real-time",
            });
        }
    }
);

// GET /api/admin/statistics/user-growth - Thống kê tăng trưởng người dùng theo tuần/tháng/năm
router.get(
    "/admin/statistics/user-growth",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const { period = "month" } = req.query;
            const now = new Date();
            const growthData = [];

            if (period === "week") {
                // Lấy dữ liệu 7 ngày gần nhất trong tuần hiện tại
                const today = new Date(now);
                const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...

                // Tính ngày đầu tuần (Thứ 2)
                const monday = new Date(today);
                monday.setDate(
                    today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
                );
                monday.setHours(0, 0, 0, 0);

                const weekDays = [
                    "Thứ 2",
                    "Thứ 3",
                    "Thứ 4",
                    "Thứ 5",
                    "Thứ 6",
                    "Thứ 7",
                    "Chủ nhật",
                ];

                for (let i = 0; i < 7; i++) {
                    const dayStart = new Date(monday);
                    dayStart.setDate(monday.getDate() + i);
                    dayStart.setHours(0, 0, 0, 0);

                    const dayEnd = new Date(dayStart);
                    dayEnd.setDate(dayEnd.getDate() + 1);

                    const dailyUsers = await User.countDocuments({
                        createdAt: {
                            $gte: dayStart,
                            $lt: dayEnd,
                        },
                    });

                    growthData.push({
                        name: weekDays[i],
                        users: dailyUsers,
                        fullDate: dayStart.toLocaleDateString("vi-VN"),
                        date: dayStart.toISOString().split("T")[0],
                    });
                }
            } else if (period === "month") {
                // Lấy dữ liệu 12 tháng gần nhất
                for (let i = 11; i >= 0; i--) {
                    const monthStart = new Date(now);
                    monthStart.setMonth(monthStart.getMonth() - i);
                    monthStart.setDate(1);
                    monthStart.setHours(0, 0, 0, 0);

                    const monthEnd = new Date(monthStart);
                    monthEnd.setMonth(monthEnd.getMonth() + 1);

                    const monthlyUsers = await User.countDocuments({
                        createdAt: {
                            $gte: monthStart,
                            $lt: monthEnd,
                        },
                    });

                    // Tạo tên tháng ngắn gọn
                    const monthNumber = monthStart.getMonth() + 1;
                    const year = monthStart.getFullYear();
                    const currentYear = now.getFullYear();

                    let displayName = `T${monthNumber}`;
                    if (year !== currentYear) {
                        displayName = `T${monthNumber}/${year
                            .toString()
                            .slice(-2)}`;
                    }

                    growthData.push({
                        name: displayName,
                        users: monthlyUsers,
                        fullDate: monthStart.toLocaleDateString("vi-VN", {
                            month: "long",
                            year: "numeric",
                        }),
                        date: monthStart.toISOString().split("T")[0],
                    });
                }
            } else if (period === "year") {
                // Lấy dữ liệu 5 năm gần nhất
                for (let i = 4; i >= 0; i--) {
                    const yearStart = new Date(now);
                    yearStart.setFullYear(yearStart.getFullYear() - i);
                    yearStart.setMonth(0, 1);
                    yearStart.setHours(0, 0, 0, 0);

                    const yearEnd = new Date(yearStart);
                    yearEnd.setFullYear(yearEnd.getFullYear() + 1);

                    const yearlyUsers = await User.countDocuments({
                        createdAt: {
                            $gte: yearStart,
                            $lt: yearEnd,
                        },
                    });

                    growthData.push({
                        name: yearStart.getFullYear().toString(),
                        users: yearlyUsers,
                        fullDate: `Năm ${yearStart.getFullYear()}`,
                        date: yearStart.toISOString().split("T")[0],
                    });
                }
            }

            res.json({
                success: true,
                data: {
                    period,
                    growthData,
                    totalPeriods: growthData.length,
                },
            });
        } catch (error) {
            console.error("Error fetching user growth statistics:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê tăng trưởng người dùng",
            });
        }
    }
);

// GET /api/admin/statistics/recent-activities - Hoạt động gần đây
router.get(
    "/admin/statistics/recent-activities",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const activities = [];

            // Lấy người dùng mới đăng ký (10 người gần nhất)
            const newUsers = await User.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .select("fullName email createdAt");

            for (const user of newUsers) {
                activities.push({
                    type: "user_register",
                    action: `<strong>${
                        user.fullName || user.email
                    }</strong> đã đăng ký tài khoản`,
                    time: user.createdAt,
                    icon: "Users",
                    color: "bg-green-500",
                });
            }

            // Lấy khóa học mới được tạo (5 khóa gần nhất)
            const newCourses = await Course.find({})
                .sort({ createdAt: -1 })
                .limit(3)
                .select("title createdAt");

            for (const course of newCourses) {
                activities.push({
                    type: "course_created",
                    action: `Khóa học <strong>${course.title}</strong> đã được tạo`,
                    time: course.createdAt,
                    icon: "BookOpen",
                    color: "bg-blue-500",
                });
            }

            // Lấy đề thi mới được tạo (3 đề gần nhất)
            const newExams = await IELTSExam.find({})
                .sort({ createdAt: -1 })
                .limit(2)
                .select("title createdAt");

            for (const exam of newExams) {
                activities.push({
                    type: "exam_created",
                    action: `Đề thi <strong>${exam.title}</strong> đã được tạo`,
                    time: exam.createdAt,
                    icon: "FileText",
                    color: "bg-yellow-500",
                });
            }

            // Lấy giao dịch mua khóa học gần nhất (5 giao dịch)
            const recentEnrollments = await Enrollment.find({})
                .sort({ enrolledAt: -1 })
                .limit(5)
                .populate("userId", "fullName email")
                .populate("courseId", "title");

            for (const enrollment of recentEnrollments) {
                const user = enrollment.userId as any;
                const course = enrollment.courseId as any;
                if (user && course) {
                    activities.push({
                        type: "course_purchased",
                        action: `<strong>${
                            user.fullName || user.email
                        }</strong> đã mua khóa học <strong>${
                            course.title
                        }</strong>`,
                        time: enrollment.enrolledAt,
                        icon: "DollarSign",
                        color: "bg-purple-500",
                    });
                }
            }

            // Sắp xếp theo thời gian và lấy số lượng yêu cầu
            const sortedActivities = activities
                .sort(
                    (a, b) =>
                        new Date(b.time).getTime() - new Date(a.time).getTime()
                )
                .slice(0, limit)
                .map((activity) => ({
                    ...activity,
                    timeAgo: getTimeAgo(activity.time),
                }));

            res.json({
                success: true,
                data: {
                    activities: sortedActivities,
                    total: sortedActivities.length,
                },
            });
        } catch (error) {
            console.error("Error fetching recent activities:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy hoạt động gần đây",
            });
        }
    }
);

export default router;
