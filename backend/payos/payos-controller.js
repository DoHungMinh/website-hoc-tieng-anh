/**
 * PayOS Controller
 * Xử lý các API endpoints cho PayOS payment
 */

const payOSService = require("./payos-service");

/**
 * Helper function để tạo timestamp với timezone Việt Nam (+7)
 */
const getVietnamTime = () => {
    const now = new Date();
    // Tính offset +7 giờ so với UTC (7 * 60 * 60 * 1000 = 25200000)
    const vietnamOffset = 7 * 60 * 60 * 1000;
    const vietnamTime = new Date(now.getTime() + vietnamOffset);
    return vietnamTime;
};

/**
 * Tạo payment link cho khóa học
 * POST /api/payos/create-payment
 */
const createPayment = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user?.id; // Từ auth middleware
        const userEmail = req.user?.email;

        console.log("📝 Tạo payment request:", { courseId, userId, userEmail });

        // Validate input
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "courseId là bắt buộc",
            });
        }

        if (!userId || !userEmail) {
            return res.status(401).json({
                success: false,
                message: "Người dùng chưa đăng nhập",
            });
        }

        // Lấy thông tin khóa học từ database
        // Import Course model (cần require đúng path)
        const Course =
            require("../src/models/Course").default ||
            require("../src/models/Course");

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khóa học",
            });
        }

        // Kiểm tra xem user đã đăng ký khóa học chưa
        const Enrollment =
            require("../src/models/Enrollment").default ||
            require("../src/models/Enrollment");

        console.log("🔍 Kiểm tra enrollment cho:", { userId, courseId });

        const existingEnrollment = await Enrollment.findOne({
            userId: userId,
            courseId: courseId,
        });

        console.log("📊 Kết quả kiểm tra enrollment:", {
            existingEnrollment: !!existingEnrollment,
            enrollmentId: existingEnrollment?._id,
            enrollmentUserId: existingEnrollment?.userId,
            enrollmentCourseId: existingEnrollment?.courseId,
        });

        if (existingEnrollment) {
            console.log("❌ User đã có enrollment:", existingEnrollment);
            return res.status(400).json({
                success: false,
                message: "Bạn đã đăng ký khóa học này rồi",
                debug: {
                    userId: userId,
                    courseId: courseId,
                    existingEnrollmentId: existingEnrollment._id,
                    existingEnrollmentUserId: existingEnrollment.userId,
                },
            });
        }

        // Chuẩn bị dữ liệu order
        const orderData = {
            courseId: course._id.toString(),
            courseName: course.title,
            price: course.price,
            userId: userId,
            userEmail: userEmail,
        };

        // Tạo payment link qua PayOS
        const paymentResult = await payOSService.createPaymentLink(orderData);

        if (paymentResult.success) {
            console.log(
                "✅ Payment link được tạo thành công cho khóa học:",
                course.title
            );

            res.json({
                success: true,
                message: "Tạo payment link thành công",
                data: paymentResult.data,
            });
        } else {
            console.error("❌ Lỗi tạo payment link:", paymentResult.message);
            res.status(500).json({
                success: false,
                message: paymentResult.message,
            });
        }
    } catch (error) {
        console.error("❌ Lỗi API tạo payment:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo payment",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Kiểm tra trạng thái thanh toán
 * GET /api/payos/payment-status/:orderCode
 */
const getPaymentStatus = async (req, res) => {
    try {
        const { orderCode } = req.params;
        const userId = req.user?.id;

        console.log(
            `🔍 Kiểm tra payment status: ${orderCode} cho user: ${userId}`
        );

        if (!orderCode) {
            return res.status(400).json({
                success: false,
                message: "orderCode là bắt buộc",
            });
        }

        // Kiểm tra trạng thái từ PayOS
        const statusResult = await payOSService.getPaymentStatus(
            parseInt(orderCode)
        );

        if (statusResult.success) {
            res.json({
                success: true,
                status: statusResult.status,
                data: statusResult.data,
            });
        } else {
            res.status(500).json({
                success: false,
                message: statusResult.message,
            });
        }
    } catch (error) {
        console.error("❌ Lỗi API kiểm tra payment status:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi kiểm tra payment status",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Webhook nhận thông báo từ PayOS
 * POST /api/payos/webhook
 */
const handleWebhook = async (req, res) => {
    try {
        console.log("🔔 PayOS Webhook nhận được:");
        console.log("Headers:", req.headers);
        console.log("Body:", JSON.stringify(req.body, null, 2));

        const webhookData = req.body;
        const signature =
            req.headers["x-payos-signature"] || req.headers["payos-signature"];

        // Kiểm tra signature từ PayOS
        if (signature) {
            console.log("🔐 Verifying PayOS signature...");
            const isValidSignature = payOSService.verifyWebhookSignature(
                webhookData,
                signature
            );

            if (!isValidSignature) {
                console.error("❌ PayOS signature không hợp lệ");
                return res.status(400).json({
                    success: false,
                    message: "Invalid PayOS signature",
                });
            }
            console.log("✅ PayOS signature hợp lệ");
        } else {
            console.log("⚠️ Không có signature - có thể là test webhook");
        }

        // PayOS webhook format có thể là:
        // 1. Direct format: { orderCode, amount, description, ... }
        // 2. Wrapped format: { data: { orderCode, amount, ... }, code, desc }

        let paymentData = webhookData;
        let status = "PAID"; // Mặc định là PAID nếu nhận được webhook

        // Nếu có field 'data', đây là wrapped format
        if (webhookData.data) {
            paymentData = webhookData.data;
            // Kiểm tra code để xác định status
            status = webhookData.code === "00" ? "PAID" : "CANCELLED";
            console.log("📝 Webhook format: Wrapped, Status:", status);
        } else {
            console.log("📝 Webhook format: Direct, Status:", status);
        }

        const { orderCode, amount, description } = paymentData;

        if (!orderCode) {
            console.error("❌ Webhook thiếu orderCode");
            return res.status(400).json({
                success: false,
                message: "Missing orderCode in webhook data",
            });
        }

        console.log("💳 Xử lý payment:", {
            orderCode,
            amount,
            description,
            status,
        });

        // Import PaymentHistory model
        const PaymentHistory = require("./PaymentHistory");

        // Tìm hoặc tạo payment record
        let payment = await PaymentHistory.findOne({ orderCode });

        if (payment) {
            console.log("🔄 Cập nhật payment hiện tại:", payment._id);

            // Cập nhật trạng thái
            payment.status = status;
            if (status === "PAID") {
                payment.paidAt = new Date();
            } else if (status === "CANCELLED") {
                payment.cancelledAt = new Date();
            }

            payment.webhookReceived = true;
            payment.webhookData = webhookData;

            await payment.save();
            console.log("✅ Đã cập nhật payment:", payment._id);
        } else {
            console.log("🆕 Tạo payment record mới từ webhook");

            // Tạo payment record mới
            payment = new PaymentHistory({
                orderCode,
                amount: amount || 0,
                description: description || `Payment #${orderCode}`,
                status,
                currency: "VND",
                paidAt: status === "PAID" ? new Date() : undefined,
                cancelledAt: status === "CANCELLED" ? new Date() : undefined,
                webhookReceived: true,
                webhookData: webhookData,
                paymentMethod: "qr_code",
            });

            await payment.save();
            console.log("✅ Đã tạo payment mới:", payment._id);
        }

        // Nếu payment thành công, xử lý enrollment
        if (status === "PAID" && description) {
            try {
                console.log("🎯 Bắt đầu xử lý enrollment từ webhook...");
                await handleEnrollmentFromWebhook(
                    orderCode,
                    description,
                    webhookData
                );
            } catch (enrollmentError) {
                console.error(
                    "❌ Lỗi xử lý enrollment từ webhook:",
                    enrollmentError
                );
                // Không throw error để không làm webhook fail
            }
        }

        // Trả về success response cho PayOS
        res.json({
            success: true,
            message: "Webhook processed successfully",
            orderCode: orderCode,
            status: status,
        });

        console.log(
            "🎉 Webhook processed thành công cho orderCode:",
            orderCode
        );
    } catch (error) {
        console.error("❌ Lỗi xử lý PayOS webhook:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xử lý webhook",
        });
    }
};

/**
 * Xử lý enrollment từ webhook
 */
const handleEnrollmentFromWebhook = async (
    orderCode,
    description,
    webhookData
) => {
    try {
        console.log(
            `🔍 Xử lý enrollment từ webhook - Order: ${orderCode}, Description: ${description}`
        );

        // ✅ CHECK 1: LEVEL ENROLLMENT (Format: "LEVEL:B2")
        const levelMatch = description.match(/^LEVEL:([A-C][12])$/i);
        if (levelMatch) {
            const level = levelMatch[1].toUpperCase();
            console.log(`🎯 Detected LEVEL payment: ${level}`);
            return await handleLevelEnrollmentFromWebhook(orderCode, level, webhookData);
        }

        // ✅ CHECK 2: COURSE ENROLLMENT
        // Tìm courseId từ description
        let courseId = null;

        // Thử các pattern khác nhau để tìm courseId
        if (description) {
            // Pattern 1: Description là courseId (24 ký tự hex)
            if (
                description.length === 24 &&
                /^[a-fA-F0-9]{24}$/.test(description)
            ) {
                courseId = description;
            } else {
                // Pattern 2: courseId nằm trong description
                const courseIdMatch = description.match(/([a-fA-F0-9]{24})/);
                if (courseIdMatch) {
                    courseId = courseIdMatch[1];
                }
            }
        }

        if (!courseId) {
            console.log(
                `⚠️ Không thể tìm courseId hoặc level từ description: ${description}`
            );
            return;
        }

        console.log(`✅ Found courseId từ webhook: ${courseId}`);

        // Import models
        const Course =
            require("../src/models/Course").default ||
            require("../src/models/Course");
        const Enrollment =
            require("../src/models/Enrollment").default ||
            require("../src/models/Enrollment");
        const User =
            require("../src/models/User").User || require("../src/models/User");

        // Kiểm tra course có tồn tại không
        const course = await Course.findById(courseId);
        if (!course) {
            console.log(`❌ Course không tồn tại: ${courseId}`);
            return;
        }

        console.log(`✅ Course found: ${course.title}`);

        // Tìm user từ payment history hoặc từ PayOS transaction
        // Lưu ý: PayOS webhook không trực tiếp cho biết userId
        // Cần tìm cách khác để xác định user

        // Pattern: Tìm payment history đã có sẵn với orderCode này
        const PaymentHistory = require("./PaymentHistory");
        const existingPayment = await PaymentHistory.findOne({ orderCode });

        let userId = null;
        if (existingPayment && existingPayment.userId) {
            userId = existingPayment.userId;
            console.log(`✅ Found userId from existing payment: ${userId}`);
        } else {
            // Nếu không có userId trong payment history, thử tìm từ counterAccountName/email
            // Điều này phức tạp và không đáng tin cậy, nên skip
            console.log(
                `⚠️ Không thể xác định userId từ webhook, skip enrollment`
            );
            return;
        }

        // Kiểm tra user có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            console.log(`❌ User không tồn tại: ${userId}`);
            return;
        }

        console.log(`✅ User found: ${user.email}`);

        // Kiểm tra đã có enrollment chưa
        const existingEnrollment = await Enrollment.findOne({
            userId: userId,
            courseId: courseId,
        });

        if (existingEnrollment) {
            console.log(
                `✅ User đã được enroll: ${user.email} -> ${course.title}`
            );
            return;
        }

        // Tạo enrollment mới
        const newEnrollment = new Enrollment({
            userId: userId,
            courseId: courseId,
            enrolledAt: new Date(),
            status: "active",
            progress: {
                completedLessons: [],
                completedVocabulary: [],
                completedGrammar: [],
                completionPercentage: 0,
            },
            quiz: {
                attempts: 0,
                bestScore: 0,
            },
            lastAccessedAt: new Date(),
            achievements: [],
        });

        await newEnrollment.save();
        console.log(
            `✅ Đã tạo enrollment thành công từ webhook: ${user.email} -> ${course.title}`
        );

        // Cập nhật payment history với courseId và userId
        await PaymentHistory.findOneAndUpdate(
            { orderCode },
            {
                courseId: courseId,
                userId: userId,
                courseName: course.title,
                userEmail: user.email,
                userFullName: user.fullName,
            }
        );

        console.log(`✅ Đã cập nhật PaymentHistory với course và user info`);

        // Gửi email thông báo (async, không chờ) với Vietnam timezone
        const emailService = require("./email-service");
        const paymentInfo = {
            userEmail: user.email,
            courseName: course.title,
            courseId: courseId,
            amount: webhookData.amount || course.price,
            paymentDate: getVietnamTime(),
            orderCode: orderCode,
        };

        emailService
            .sendPaymentSuccessEmail(paymentInfo)
            .then((emailResult) => {
                if (emailResult.success) {
                    console.log(
                        `✅ Payment success email sent: ${emailResult.messageId}`
                    );
                    console.log(
                        `📧 Đã gửi email thông báo thanh toán thành công tới ${user.email}`
                    );
                } else {
                    console.warn(
                        `⚠️ Không thể gửi email tới ${user.email}:`,
                        emailResult.message
                    );
                }
            })
            .catch((emailError) => {
                console.error(
                    `❌ Lỗi gửi email tới ${user.email}:`,
                    emailError
                );
            });
    } catch (error) {
        console.error("❌ Lỗi trong handleEnrollmentFromWebhook:", error);
        throw error;
    }
};

/**
 * 🎯 Xử lý LEVEL enrollment từ webhook (CRITICAL cho payment safety)
 * Function này đảm bảo user không mất tiền khi thanh toán thành công
 */
const handleLevelEnrollmentFromWebhook = async (orderCode, level, webhookData) => {
    try {
        console.log(`🎯 Xử lý LEVEL enrollment từ webhook - Order: ${orderCode}, Level: ${level}`);

        // Import models
        console.log("🔧 Importing models...");
        const PaymentHistory = require("./PaymentHistory");
        const LevelPackageModule = require("../src/models/LevelPackage");
        const LevelPackage = LevelPackageModule.default || LevelPackageModule;
        const LevelEnrollmentModule = require("../src/models/LevelEnrollment");
        const LevelEnrollment = LevelEnrollmentModule.default || LevelEnrollmentModule;
        const UserModule = require("../src/models/User");
        const User = UserModule.User || UserModule.default || UserModule;

        // Tìm userId từ payment history
        const existingPayment = await PaymentHistory.findOne({ orderCode });
        if (!existingPayment || !existingPayment.userId) {
            console.log(`⚠️ Không tìm thấy userId trong payment history cho orderCode: ${orderCode}`);
            return;
        }

        const userId = existingPayment.userId;
        console.log(`✅ Found userId: ${userId}`);

        // Kiểm tra user tồn tại
        const user = await User.findById(userId);
        if (!user) {
            console.log(`❌ User không tồn tại: ${userId}`);
            return;
        }
        console.log(`✅ User found: ${user.email}`);

        // Kiểm tra level package tồn tại
        const levelPackage = await LevelPackage.findOne({ level, status: 'active' });
        if (!levelPackage) {
            console.log(`❌ Level package không tồn tại: ${level}`);
            return;
        }
        console.log(`✅ Level package found: ${levelPackage.name}`);

        // ✅ IDEMPOTENT CHECK: Kiểm tra đã có enrollment chưa
        const existingEnrollment = await LevelEnrollment.findOne({
            userId: userId,
            level: level
        });

        if (existingEnrollment) {
            console.log(`✅ Level enrollment đã tồn tại: ${user.email} -> ${level} (created at: ${existingEnrollment.enrolledAt})`);
            // Cập nhật payment history nếu chưa có thông tin
            if (!existingPayment.level || !existingPayment.levelPackageName) {
                await PaymentHistory.findOneAndUpdate(
                    { orderCode },
                    {
                        level: level,
                        levelPackageName: levelPackage.name,
                        userEmail: user.email,
                        userFullName: user.fullName
                    }
                );
                console.log(`✅ Updated payment history with level info`);
            }
            return; // Không tạo duplicate
        }

        // Tạo level enrollment mới
        const newEnrollment = new LevelEnrollment({
            userId: userId,
            level: level,
            levelPackageId: levelPackage._id,
            enrolledAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 năm
            status: 'active',
            paymentStatus: 'paid',
            paymentInfo: {
                orderCode: orderCode,
                amount: webhookData.amount || levelPackage.price,
                paidAt: new Date()
            }
        });

        await newEnrollment.save();
        console.log(`✅ ĐÃ TẠO LEVEL ENROLLMENT TỪ WEBHOOK: ${user.email} -> ${level}`);

        // Cập nhật payment history
        await PaymentHistory.findOneAndUpdate(
            { orderCode },
            {
                level: level,
                levelPackageName: levelPackage.name,
                userId: userId,
                userEmail: user.email,
                userFullName: user.fullName,
                status: 'PAID',
                paidAt: new Date()
            }
        );
        console.log(`✅ Updated payment history with level enrollment info`);

        // TODO: Gửi email thông báo (optional)
        console.log(`📧 Email notification skipped for level enrollment (can be added later)`);

    } catch (error) {
        console.error("❌ Lỗi trong handleLevelEnrollmentFromWebhook:", error);
        throw error;
    }
};

/**
 * Xử lý thanh toán thành công
 */
const handleSuccessfulPayment = async (webhookData) => {
    try {
        const { orderCode } = webhookData;
        const PaymentHistory = require("./PaymentHistory");

        console.log(`💰 Xử lý thanh toán thành công: ${orderCode}`);

        // Cập nhật PaymentHistory với Vietnam timezone
        const updatedPayment = await PaymentHistory.findOneAndUpdate(
            { orderCode },
            {
                status: "PAID",
                paidAt: getVietnamTime(),
                webhookReceived: true,
                webhookData,
            },
            { new: true }
        );

        if (updatedPayment) {
            console.log("✅ Đã cập nhật PaymentHistory cho order:", orderCode);
        } else {
            console.warn(
                "⚠️ Không tìm thấy PaymentHistory cho order:",
                orderCode
            );
        }
    } catch (error) {
        console.error("❌ Lỗi xử lý thanh toán thành công:", error);
    }
};

/**
 * Xử lý thanh toán bị hủy
 */
const handleCancelledPayment = async (webhookData) => {
    try {
        const { orderCode } = webhookData;
        const PaymentHistory = require("./PaymentHistory");

        console.log(`🚫 Xử lý thanh toán bị hủy: ${orderCode}`);

        // Cập nhật PaymentHistory với Vietnam timezone
        await PaymentHistory.findOneAndUpdate(
            { orderCode },
            {
                status: "CANCELLED",
                cancelledAt: getVietnamTime(),
                webhookReceived: true,
                webhookData,
            }
        );

        console.log(
            "✅ Đã cập nhật PaymentHistory cho order bị hủy:",
            orderCode
        );

        console.log("✅ Đã xử lý thanh toán bị hủy cho order:", orderCode);
    } catch (error) {
        console.error("❌ Lỗi xử lý thanh toán bị hủy:", error);
    }
};

/**
 * Hủy payment link
 * POST /api/payos/cancel-payment/:orderCode
 */
const cancelPayment = async (req, res) => {
    try {
        const { orderCode } = req.params;
        const { reason } = req.body;
        const userId = req.user?.id;

        console.log(`🚫 Hủy payment: ${orderCode} bởi user: ${userId}`);

        if (!orderCode) {
            return res.status(400).json({
                success: false,
                message: "orderCode là bắt buộc",
            });
        }

        // Hủy payment qua PayOS
        const cancelResult = await payOSService.cancelPaymentLink(
            parseInt(orderCode),
            reason || "User cancelled"
        );

        if (cancelResult.success) {
            res.json({
                success: true,
                message: "Đã hủy payment thành công",
                data: cancelResult.data,
            });
        } else {
            res.status(500).json({
                success: false,
                message: cancelResult.message,
            });
        }
    } catch (error) {
        console.error("❌ Lỗi API hủy payment:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi hủy payment",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Tạo payment link cho LEVEL PACKAGE
 * POST /api/payos/create-level-payment
 */
const createLevelPayment = async (req, res) => {
    try {
        const { level } = req.body;
        const userId = req.user?.id;
        const userEmail = req.user?.email;

        console.log("📝 Tạo level payment request:", { level, userId, userEmail });

        // Validate input
        if (!level) {
            return res.status(400).json({
                success: false,
                message: "level là bắt buộc (A1, A2, B1, B2, C1, C2)",
            });
        }

        if (!userId || !userEmail) {
            return res.status(401).json({
                success: false,
                message: "Người dùng chưa đăng nhập",
            });
        }

        // Import models
        console.log("🔧 Importing models...");
        const LevelPackageModule = require("../src/models/LevelPackage");
        const LevelPackage = LevelPackageModule.default || LevelPackageModule;
        const LevelEnrollmentModule = require("../src/models/LevelEnrollment");
        const LevelEnrollment = LevelEnrollmentModule.default || LevelEnrollmentModule;
        console.log("✅ Models imported successfully", {
            LevelPackageType: typeof LevelPackage,
            hasFind: typeof LevelPackage.findOne
        });

        // Lấy thông tin level package
        console.log("🔍 Finding level package:", { level, status: 'active' });
        const levelPackage = await LevelPackage.findOne({ level, status: 'active' });
        if (!levelPackage) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy Level ${level} Package`,
            });
        }

        // Kiểm tra xem user đã mua level này chưa
        console.log("🔍 Kiểm tra level enrollment cho:", { userId, level });

        const existingEnrollment = await LevelEnrollment.findOne({
            userId: userId,
            level: level,
        });

        if (existingEnrollment) {
            console.log("❌ User đã mua level này:", existingEnrollment);
            return res.status(400).json({
                success: false,
                message: `Bạn đã sở hữu Level ${level} rồi`,
                enrolledAt: existingEnrollment.enrolledAt,
            });
        }

        // Chuẩn bị dữ liệu order cho PayOS
        const orderData = {
            level: level,
            levelName: levelPackage.name,
            price: levelPackage.price,
            userId: userId,
            userEmail: userEmail,
        };

        // Tạo payment link qua PayOS
        const paymentResult = await payOSService.createLevelPaymentLink(orderData);

        if (paymentResult.success) {
            console.log(
                "✅ Level payment link được tạo thành công:",
                levelPackage.name
            );

            res.json({
                success: true,
                message: "Tạo payment link thành công",
                data: paymentResult.data,
            });
        } else {
            console.error("❌ Lỗi tạo level payment link:", paymentResult.message);
            res.status(500).json({
                success: false,
                message: paymentResult.message,
            });
        }
    } catch (error) {
        console.error("❌ Lỗi API tạo level payment:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo level payment",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/**
 * Xử lý khi level payment thành công
 * POST /api/payos/level-payment-success
 */
const handleLevelPaymentSuccess = async (req, res) => {
    try {
        const { orderCode, level } = req.body;
        const userId = req.user?.id;

        console.log(`🎯 Xử lý level payment success: ${orderCode} cho user: ${userId}, level: ${level}`);

        if (!orderCode) {
            return res.status(400).json({
                success: false,
                message: "orderCode là bắt buộc",
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Người dùng chưa đăng nhập",
            });
        }

        // Kiểm tra trạng thái payment từ PayOS
        const paymentStatus = await payOSService.getPaymentStatus(
            parseInt(orderCode)
        );

        if (!paymentStatus.success || paymentStatus.status !== "PAID") {
            return res.status(400).json({
                success: false,
                message: "Thanh toán chưa được xác nhận hoặc chưa thành công",
            });
        }

        const paymentData = paymentStatus.data;

        // Parse level từ payment description
        let targetLevel = level; // Ưu tiên level từ request body
        if (!targetLevel && paymentData.description) {
            // Description format: "LEVEL:A1" hoặc chỉ "A1"
            const levelMatch = paymentData.description.match(/(?:LEVEL:)?([ABC][12])/);
            if (levelMatch) {
                targetLevel = levelMatch[1];
            }
        }

        if (!targetLevel) {
            return res.status(400).json({
                success: false,
                message: "Không thể xác định level từ payment",
            });
        }

        console.log("🎯 Target level:", targetLevel);

        // Import models with error handling
        let LevelPackage, LevelEnrollment, User;
        try {
            console.log("🔧 Importing models...");
            const LevelPackageModule = require("../src/models/LevelPackage");
            LevelPackage = LevelPackageModule.default || LevelPackageModule;
            const LevelEnrollmentModule = require("../src/models/LevelEnrollment");
            LevelEnrollment = LevelEnrollmentModule.default || LevelEnrollmentModule;
            const UserModule = require("../src/models/User");
            User = UserModule.User || UserModule.default || UserModule;
            console.log("✅ Models imported successfully", {
                LevelPackageType: typeof LevelPackage,
                LevelEnrollmentType: typeof LevelEnrollment,
                UserType: typeof User,
                hasFindOne: typeof LevelPackage.findOne
            });
        } catch (importError) {
            console.error("❌ Error importing models:", importError);
            return res.status(500).json({
                success: false,
                message: "Lỗi hệ thống khi import models",
                error: process.env.NODE_ENV === 'development' ? importError.message : undefined
            });
        }

        // Kiểm tra level package có tồn tại không
        const levelPackage = await LevelPackage.findOne({ level: targetLevel });
        if (!levelPackage) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy Level ${targetLevel} Package`,
            });
        }

        // Kiểm tra user đã enrolled chưa
        const existingEnrollment = await LevelEnrollment.findOne({
            userId: userId,
            level: targetLevel,
        });

        if (existingEnrollment) {
            return res.json({
                success: true,
                message: `Bạn đã sở hữu Level ${targetLevel} rồi`,
                enrollment: existingEnrollment,
            });
        }

        // Tạo level enrollment mới
        const newEnrollment = new LevelEnrollment({
            userId: userId,
            level: targetLevel,
            enrolledAt: new Date(),
            status: "active",
            orderCode: parseInt(orderCode),
            paidAmount: paymentData.amount || levelPackage.price,
            paymentDate: new Date(),
            lastAccessedAt: new Date(),
        });

        try {
            await newEnrollment.save();
            console.log(
                `✅ Đã tạo level enrollment thành công cho user ${userId} - level ${targetLevel}`
            );
        } catch (saveError) {
            // ✅ Handle duplicate key error gracefully
            if (saveError.code === 11000) {
                console.log(`⚠️ Level enrollment đã tồn tại (duplicate), skip tạo mới`);
                // Vẫn trả về success vì user đã có enrollment rồi
                const existing = await LevelEnrollment.findOne({ userId, level: targetLevel });
                return res.json({
                    success: true,
                    message: `Bạn đã sở hữu Level ${targetLevel} rồi`,
                    enrollment: existing,
                });
            }
            throw saveError; // Re-throw nếu không phải duplicate error
        }

        // Lưu vào PaymentHistory để admin có thể theo dõi
        try {
            const PaymentHistory = require("./PaymentHistory");
            const { User } = require("../src/models/User");
            
            const user = await User.findById(userId);
            
            const paymentHistory = new PaymentHistory({
                orderCode: parseInt(orderCode),
                status: "PAID",
                amount: paymentData.amount || levelPackage.price,
                description: `Level ${targetLevel} Package - ${levelPackage.name}`,
                level: targetLevel,
                levelPackageName: levelPackage.name,
                userId: userId,
                userEmail: user?.email || req.user?.email,
                userFullName: user?.fullName || user?.name || "N/A",
                paymentMethod: "qr_code",
                currency: "VND",
                paidAt: new Date(),
                webhookReceived: false,
            });
            
            await paymentHistory.save();
            console.log("✅ Đã lưu payment history cho level enrollment");
        } catch (historyError) {
            console.error("⚠️ Lỗi khi lưu payment history:", historyError.message);
            // Không throw error để không ảnh hưởng đến enrollment
        }

        // Tăng studentsCount của level package
        await LevelPackage.findOneAndUpdate(
            { level: targetLevel },
            { $inc: { studentsCount: 1 } }
        );

        // Lấy thông tin user để gửi email
        const user = await User.findById(userId);

        // Update PaymentHistory
        try {
            const PaymentHistory = require("./PaymentHistory");
            await PaymentHistory.findOneAndUpdate(
                { orderCode: parseInt(orderCode) },
                {
                    $set: {
                        level: targetLevel,
                        levelName: levelPackage.name,
                        userId: userId,
                        userEmail: user?.email,
                        userFullName: user?.fullName,
                        status: "PAID",
                        paidAt: new Date(),
                    },
                },
                { new: true, upsert: true }
            );
            console.log("✅ PaymentHistory updated for level payment");
        } catch (error) {
            console.error("❌ Error updating PaymentHistory:", error);
        }

        // Gửi email thông báo (không chờ)
        if (user && user.email) {
            const emailService = require("./email-service");
            const emailInfo = {
                userEmail: user.email,
                courseName: `Level ${targetLevel} - ${levelPackage.name}`, // Sử dụng format tương tự course
                courseId: levelPackage._id,
                amount: paymentData.amount || levelPackage.price,
                paymentDate: new Date(),
                orderCode: orderCode,
            };

            emailService
                .sendPaymentSuccessEmail(emailInfo) // ✅ Dùng function có sẵn
                .then((emailResult) => {
                    if (emailResult.success) {
                        console.log(`📧 Đã gửi email thông báo mua level tới ${user.email}`);
                    }
                })
                .catch((emailError) => {
                    console.error(`❌ Lỗi gửi email:`, emailError);
                });
        }

        return res.json({
            success: true,
            message: `Chúc mừng! Bạn đã sở hữu Level ${targetLevel} Package`,
            enrollment: newEnrollment,
            levelInfo: {
                level: targetLevel,
                name: levelPackage.name,
                totalCourses: levelPackage.totalCourses,
            },
        });
    } catch (error) {
        console.error("❌ Lỗi xử lý level payment success:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xử lý thanh toán level",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

module.exports = {
    createPayment,
    getPaymentStatus,
    handleWebhook,
    cancelPayment,
    createLevelPayment,
    handleLevelPaymentSuccess,
};
