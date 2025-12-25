import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
// restart trigger
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require("../config/database");

// Import routes
import allRoutes from "./routes/index";

// Import middleware
import {
    errorHandler,
    handleUncaughtException,
    handleUnhandledRejection,
} from "./middleware/errorHandler";
import { timeoutMiddleware, healthCheck } from "./middleware/timeout";
import { requestLogger } from "./middleware/logger";
import {
    updateUserActivity,
    startUserActivityCleanup,
} from "./middleware/userActivity";
import { optionalAuth } from "./middleware/auth";
import { realtimeService } from "./services/realtimeService";

// Setup global error handlers
handleUncaughtException();
handleUnhandledRejection();

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_URL || "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://localhost:3001",
        ],
        methods: ["GET", "POST"],
    },
});

// Security middleware
app.use(helmet());
app.use(compression());

// Timeout middleware (30 second timeout) - SKIP for AI generation routes
app.use((req, res, next) => {
    // Skip timeout for AI generation endpoints (they need more time)
    const aiGenerationRoutes = [
        '/api/ai/generate-ielts-reading',
        '/api/ai/generate-course',
        '/api/chatbot',
        '/generate-all-audio',
        '/generate-word-audio'
    ];

    const isAIRoute = aiGenerationRoutes.some(route => req.path.includes(route));

    if (isAIRoute) {
        console.log(`⏱️ Skipping timeout for AI route: ${req.path}`);
        return next();
    }

    // Apply normal timeout for other routes
    return timeoutMiddleware(30000)(req, res, next);
});

// Rate limiting for general routes
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "5000"), // Tăng từ 1000 lên 5000
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip general limiter for admin routes (they have their own limiter)
        const adminRoutes = ['/api/ielts', '/api/course', '/api/analytics', '/api/users'];
        return adminRoutes.some(route => req.path.startsWith(route));
    },
});

// Admin rate limiter - cao hơn nhưng vẫn có giới hạn để bảo vệ server
const adminLimiter = rateLimit({
    windowMs: 60000, // 1 phút
    max: 200, // 200 requests/phút cho admin (cao hơn nhiều so với user)
    message: "Too many admin requests, please slow down.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiter - riêng cho đăng nhập/đăng ký
const authLimiter = rateLimit({
    windowMs: 60000, // 1 phút
    max: 50, // 50 request auth mỗi phút cho mỗi IP
    message:
        "Quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau ít phút.",
    standardHeaders: true,
    legacyHeaders: false,
});

// PayOS rate limiter - riêng cho thanh toán
const payosLimiter = rateLimit({
    windowMs: 60000, // 1 phút
    max: 20, // 20 request thanh toán mỗi phút
    message: "Too many payment requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Heartbeat rate limiter - more lenient for heartbeat endpoint
const heartbeatLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 100, // allow 100 heartbeat requests per minute per IP
    message:
        "Too many heartbeat requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for non-heartbeat requests
        return !req.path.includes("/heartbeat");
    },
});

// Admin statistics rate limiter - moderate limits for admin dashboard
const adminStatsLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 60, // allow 60 requests per minute for admin statistics
    message: "Too many statistics requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Payment management rate limiter - higher limits for payment dashboard
const paymentStatsLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 200, // allow 200 requests per minute for payment stats/history
    message: "Too many payment management requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Only apply to payment-related endpoints
        return !req.path.includes("/payments/");
    },
});

// CORS configuration
app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL || "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://localhost:3001",
        ],
        credentials: true,
    })
);

// Apply heartbeat-specific rate limiting first
app.use("/api/user/heartbeat", heartbeatLimiter);

// Apply admin statistics rate limiter
app.use("/api/admin/statistics", adminStatsLimiter);

// Apply payment management rate limiter
app.use("/api/payments", paymentStatsLimiter);

// Apply auth-specific rate limiter
app.use("/api/auth", authLimiter);

// Apply PayOS specific rate limiter
app.use("/api/payos", payosLimiter);

// Apply admin rate limiter for admin routes
app.use("/api/ielts", adminLimiter);
app.use("/api/course", adminLimiter);
app.use("/api/analytics", adminLimiter);
app.use("/api/users", adminLimiter);

// Apply general rate limiting to all other routes
app.use((req, res, next) => {
    if (
        req.path.includes("/heartbeat") ||
        req.path.includes("/admin/statistics") ||
        req.path.includes("/auth") ||
        req.path.includes("/payos") ||
        req.path.includes("/payments") ||
        req.path.includes("/ielts") ||
        req.path.includes("/course") ||
        req.path.includes("/analytics") ||
        req.path.includes("/users")
    ) {
        // Skip general rate limiting for special endpoints
        return next();
    }
    return limiter(req, res, next);
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);

// Optional authentication (sets req.user if token exists)
app.use("/api", optionalAuth);

// User activity tracking middleware (for authenticated routes)
app.use("/api", updateUserActivity);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
        message: "English Learning Platform API is running",
        timestamp: new Date().toISOString(),
        database: "Connected to MongoDB Atlas",
    });
});

// API Routes - All routes are now consolidated in one file
app.use("/api", allRoutes);

// PayOS Routes
const payOSRoutes = require("../payos/payos-routes");
app.use("/api/payos", payOSRoutes);

// Health check endpoint
app.get("/health", healthCheck);

// Trigger restart for PayOS fix

// Test database endpoint
app.get("/api/test-db", async (req: Request, res: Response) => {
    try {
        const mongoose = require("mongoose");
        const dbStatus = mongoose.connection.readyState;
        const statusMap: { [key: number]: string } = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting",
        };

        res.json({
            status: "success",
            database: statusMap[dbStatus] || "unknown",
            host: mongoose.connection.host,
            name: mongoose.connection.name,
        });
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: "Database connection failed",
            error: error.message,
        });
    }
});

// Create test user (GET for easy testing)
app.get("/api/create-test-user", async (req: Request, res: Response) => {
    try {
        const { User } = require("./models/User");

        // Check if test user already exists
        const existingUser = await User.findOne({
            email: "test@english-learning.com",
        });

        if (existingUser) {
            res.json({
                status: "success",
                message: "Test user already exists",
                user: {
                    id: existingUser._id,
                    email: existingUser.email,
                    fullName: existingUser.fullName,
                    level: existingUser.level,
                },
            });
            return;
        }

        // Create new test user
        const testUser = new User({
            email: "test@english-learning.com",
            password: "password123",
            fullName: "Test User",
            level: "A1",
            learningGoals: ["speaking", "listening"],
            preferences: {
                language: "vi",
                timezone: "Asia/Ho_Chi_Minh",
                notifications: {
                    email: true,
                    push: true,
                },
            },
        });

        const savedUser = await testUser.save();

        res.status(201).json({
            status: "success",
            message:
                "Test user created successfully - Check MongoDB Atlas Collections!",
            user: {
                id: savedUser._id,
                email: savedUser.email,
                fullName: savedUser.fullName,
                level: savedUser.level,
                createdAt: savedUser.createdAt,
            },
        });
    } catch (error: any) {
        console.error("❌ Create test user error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to create test user",
            error: error.message,
        });
    }
});

// Socket.IO connection handling
io.on("connection", (socket: any) => {
    console.log("🔗 User connected:", socket.id);

    // Initialize realtime service with socket.io instance
    realtimeService.setSocketIO(io);

    socket.on("join_room", (userId: string) => {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined room`);
    });

    // Admin joins admin room for statistics updates
    socket.on("join_admin", () => {
        socket.join("admin_room");
        console.log("👑 Admin joined admin room for real-time updates");
    });

    socket.on("chat_message", async (data: any) => {
        try {
            // Here we'll implement AI chatbot logic later
            console.log("💬 Chat message:", data);

            // Echo response for now
            socket.emit("chat_response", {
                message: `Echo: ${data.message}`,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error("❌ Chat error:", error);
            socket.emit("chat_error", {
                message: "Chat service temporarily unavailable",
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("🔌 User disconnected:", socket.id);
    });
});

// Error handling middleware
app.use(errorHandler);

// Root route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to English Learning Platform API",
        documentation: "/api-docs" // Reserved for future Swagger docs
    });
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
    res.status(404).json({
        status: "error",
        message: "Route not found",
        path: req.originalUrl,
    });
});

// Start server
const PORT = process.env.PORT || 5003;

// Connect to database and start server
connectDB()
    .then(() => {
        // Initialize email service
        try {
            const emailService = require("../payos/email-service");
            if (emailService.validateEmailConfig()) {
                const initialized = emailService.initializeEmailTransporter();
                if (initialized) {
                    console.log("📧 Email service initialized successfully");
                } else {
                    console.warn("⚠️  Email service failed to initialize");
                }
            } else {
                console.warn(
                    "⚠️  Email service config invalid, emails will not be sent"
                );
            }
        } catch (error) {
            console.error("❌ Error initializing email service:", error);
        }

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);

            // Initialize realtime service with socket.io
            realtimeService.setSocketIO(io);
            console.log("📡 Real-time service initialized");

            // Start user activity cleanup
            startUserActivityCleanup();
        });
    })
    .catch((error: any) => {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    });
