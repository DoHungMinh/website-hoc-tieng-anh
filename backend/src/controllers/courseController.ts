import { Request, Response } from "express";
import Course, { ICourse } from "../models/Course";
import Enrollment from "../models/Enrollment";
import { User } from "../models/User";
import { aiCourseGeneratorService } from "../services/aiCourseGeneratorService";

// Import PayOS service
const payOSService = require("../../payos/payos-service");
const emailService = require("../../payos/email-service");

// Get all courses with filters
export const getCourses = async (req: Request, res: Response) => {
    try {
        const { search, type, level, status, page = 1, limit = 10 } = req.query;

        // Validate and sanitize pagination
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
        const skip = (pageNum - 1) * limitNum;

        const filter: any = {};

        if (search && typeof search === 'string' && search.trim()) {
            // Escape regex special characters
            const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { title: { $regex: sanitizedSearch, $options: "i" } },
                { description: { $regex: sanitizedSearch, $options: "i" } },
                { instructor: { $regex: sanitizedSearch, $options: "i" } },
            ];
        }

        // Validate enum values
        const validTypes = ['vocabulary', 'grammar', 'conversation', 'ielts', 'toeic', 'business'];
        const validLevels = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];
        const validStatuses = ['draft', 'active', 'archived'];

        if (type && type !== "all" && validTypes.includes(type as string)) {
            filter.type = type;
        }
        if (level && level !== "all" && validLevels.includes(level as string)) {
            filter.level = level;
        }
        if (status && status !== "all" && validStatuses.includes(status as string)) {
            filter.status = status;
        }

        const courses = await Course.find(filter)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 })
            .maxTimeMS(10000) // 10 second timeout
            .lean();

        const total = await Course.countDocuments(filter).maxTimeMS(5000);

        res.json({
            success: true,
            data: courses,
            pagination: {
                current: pageNum,
                pages: Math.ceil(total / limitNum),
                total,
            },
        });
    } catch (error: any) {
        console.error("Get courses error:", error);
        
        if (error.code === 50 || error.message?.includes('timeout')) {
            res.status(504).json({
                success: false,
                message: "Truy vấn mất quá nhiều thời gian, vui lòng thử lại",
            });
            return;
        }
        
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách khóa học",
        });
    }
};

// Get public courses for users
export const getPublicCourses = async (req: Request, res: Response) => {
    try {
        const { type, level } = req.query;

        const filter: any = { status: "active" };
        
        // Validate enum values
        const validTypes = ['vocabulary', 'grammar', 'conversation', 'ielts', 'toeic', 'business'];
        const validLevels = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];
        
        if (type && type !== "all" && validTypes.includes(type as string)) {
            filter.type = type;
        }
        if (level && level !== "all" && validLevels.includes(level as string)) {
            filter.level = level;
        }

        const courses = await Course.find(filter)
            .select("-vocabulary -grammar") // Exclude detailed content for public view
            .sort({ createdAt: -1 })
            .maxTimeMS(10000)
            .lean();

        res.json({
            success: true,
            data: courses,
        });
    } catch (error: any) {
        console.error("Get public courses error:", error);
        
        if (error.code === 50 || error.message?.includes('timeout')) {
            res.status(504).json({
                success: false,
                message: "Truy vấn mất quá nhiều thời gian, vui lòng thử lại",
            });
            return;
        }
        
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách khóa học",
        });
    }
};

// Get course by ID
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy khóa học",
            });
            return;
        }

        res.json({
            success: true,
            data: course,
        });
    } catch (error) {
        console.error("Get course by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thông tin khóa học",
        });
    }
};

// Create new course
export const createCourse = async (req: Request, res: Response) => {
    try {
        const courseData = req.body;

        // Validate required fields
        if (
            !courseData.title ||
            !courseData.description ||
            !courseData.type ||
            !courseData.level ||
            !courseData.duration ||
            !courseData.instructor
        ) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin bắt buộc",
            });
        }

        // Ensure price is a valid number
        if (typeof courseData.price !== "number" || isNaN(courseData.price)) {
            courseData.price = 0;
        }

        const course = new Course(courseData);
        await course.save();

        return res.status(201).json({
            success: true,
            message: "Tạo khóa học thành công",
            data: course,
        });
    } catch (error) {
        console.error("Create course error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi tạo khóa học",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const course = await Course.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khóa học",
            });
        }

        return res.json({
            success: true,
            message: "Cập nhật khóa học thành công",
            data: course,
        });
    } catch (error) {
        console.error("Update course error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật khóa học",
        });
    }
};

// Delete course
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khóa học",
            });
        }

        return res.json({
            success: true,
            message: "Xóa khóa học thành công",
        });
    } catch (error) {
        console.error("Delete course error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi xóa khóa học",
        });
    }
};

// Update course status
export const updateCourseStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const course = await Course.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khóa học",
            });
        }

        return res.json({
            success: true,
            message: "Cập nhật trạng thái thành công",
            data: course,
        });
    } catch (error) {
        console.error("Update course status error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật trạng thái",
        });
    }
};

// Get course statistics
export const getCourseStats = async (req: Request, res: Response) => {
    try {
        const total = await Course.countDocuments();
        const active = await Course.countDocuments({ status: "active" });
        const draft = await Course.countDocuments({ status: "draft" });
        const archived = await Course.countDocuments({ status: "archived" });
        const vocabulary = await Course.countDocuments({ type: "vocabulary" });
        const grammar = await Course.countDocuments({ type: "grammar" });

        return res.json({
            success: true,
            data: {
                total,
                active,
                draft,
                archived,
                vocabulary,
                grammar,
            },
        });
    } catch (error) {
        console.error("Get course stats error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thống kê khóa học",
        });
    }
};

// Handle PayOS payment completion and course enrollment
export const handlePayOSPaymentSuccess = async (
    req: Request,
    res: Response
) => {
    try {
        console.log("🎯 Payment success endpoint called");
        console.log("📝 Request body:", JSON.stringify(req.body, null, 2));
        console.log("👤 User from token:", (req as any).user);

        const { orderCode, courseId: frontendCourseId } = req.body;
        const userId = (req as any).user?.id;

        console.log(
            `🎯 Xử lý thanh toán thành công PayOS: ${orderCode} cho user: ${userId}`
        );

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

        // Lấy thông tin payment để biết courseId
        const paymentData = paymentStatus.data;

        console.log(
            "🔍 Full PayOS response:",
            JSON.stringify(paymentStatus, null, 2)
        );
        console.log(
            "🔍 Payment data structure:",
            JSON.stringify(paymentData, null, 2)
        );

        // Tìm course từ payment description
        // PayOS v2 không trả về description trực tiếp, mà trong transactions[0].description
        let courseId = null;

        // Thử tìm courseId từ transaction description
        if (paymentData.transactions && paymentData.transactions.length > 0) {
            const transactionDesc = paymentData.transactions[0].description;
            // Tìm pattern courseId (24 ký tự hex) trong description, bỏ qua line breaks
            const cleanDesc = transactionDesc?.replace(/\s+/g, " "); // Thay nhiều spaces/newlines thành 1 space
            const courseIdMatch = cleanDesc?.match(/([a-fA-F0-9]{24})/);
            if (courseIdMatch) {
                courseId = courseIdMatch[1];
            }
        }

        // Fallback: PayOS có thể lưu ở field description (phiên bản cũ)
        if (!courseId && paymentData.description) {
            if (paymentData.description.length === 24) {
                courseId = paymentData.description;
            } else {
                const courseIdMatch =
                    paymentData.description.match(/([a-fA-F0-9]{24})/);
                if (courseIdMatch) {
                    courseId = courseIdMatch[1];
                }
            }
        }

        console.log("🔍 Payment data:", paymentData);
        console.log(
            "🔍 Transaction description:",
            paymentData.transactions?.[0]?.description
        );
        console.log("🎯 Found courseId:", courseId);

        // Fallback: Tìm courseId từ PaymentHistory collection
        if (!courseId) {
            try {
                console.log(
                    "🔍 Attempting to find courseId in PaymentHistory..."
                );
                const PaymentHistory = require("../../payos/PaymentHistory");

                // Try to find by orderCode first
                let paymentRecord = await PaymentHistory.findOne({
                    orderCode: parseInt(orderCode),
                });

                // If not found by orderCode, try to find recent payment by userId
                if (!paymentRecord && userId) {
                    console.log(
                        "🔍 Trying to find recent payment by userId..."
                    );
                    paymentRecord = await PaymentHistory.findOne({
                        userId: userId,
                        status: { $in: ["PENDING", "PROCESSING", "PAID"] },
                    }).sort({ createdAt: -1 });
                }

                console.log("📊 PaymentHistory query result:", paymentRecord);

                if (paymentRecord && paymentRecord.courseId) {
                    courseId = paymentRecord.courseId.toString();
                    console.log(
                        "🎯 Found courseId from PaymentHistory:",
                        courseId
                    );
                } else {
                    console.log("❌ No courseId found in PaymentHistory");
                }
            } catch (error) {
                console.error(
                    "❌ Error finding payment in PaymentHistory:",
                    error
                );
            }
        }

        // Final fallback: Use courseId from frontend if provided
        if (!courseId && frontendCourseId) {
            console.log("🎯 Using courseId from frontend:", frontendCourseId);
            courseId = frontendCourseId;
        }

        if (!courseId) {
            console.log(
                "❌ Final result: No courseId found after all attempts"
            );
            console.log("📊 Debug summary:");
            console.log("   - orderCode:", orderCode);
            console.log("   - userId:", userId);
            console.log(
                "   - paymentData structure:",
                Object.keys(paymentData || {})
            );
            console.log(
                "   - transactions:",
                paymentData?.transactions?.length || 0
            );

            return res.status(400).json({
                success: false,
                message: "Không thể xác định khóa học từ payment",
                debug: {
                    orderCode,
                    userId,
                    hasPaymentData: !!paymentData,
                    transactionCount: paymentData?.transactions?.length || 0,
                },
            });
        }

        // Kiểm tra course có tồn tại không
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khóa học",
            });
        }

        // Kiểm tra user đã đăng ký chưa
        const existingEnrollment = await Enrollment.findOne({
            userId: userId,
            courseId: courseId,
        });

        if (existingEnrollment) {
            return res.json({
                success: true,
                message: "Bạn đã được đăng ký khóa học này rồi",
                data: {
                    courseId: course._id,
                    courseName: course.title,
                    enrolledAt: existingEnrollment.enrolledAt,
                },
            });
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
            `✅ Đã tạo enrollment thành công cho user ${userId} - course ${courseId}`
        );

        // Lấy thông tin user để gửi email
        const user = await User.findById(userId);

        // ✅ FIX: Update PaymentHistory với courseId và userId
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");
            const updateResult = await PaymentHistory.findOneAndUpdate(
                { orderCode: parseInt(orderCode) },
                {
                    $set: {
                        courseId: courseId,
                        userId: userId,
                        courseName: course.title,
                        userEmail: user?.email,
                        userFullName: user?.fullName,
                        status: "PAID", // Ensure status is set
                        paidAt: new Date(),
                    },
                },
                { new: true }
            );

            if (updateResult) {
                console.log(
                    "✅ PaymentHistory updated successfully:",
                    updateResult._id
                );
            } else {
                console.log(
                    "⚠️ PaymentHistory not found for orderCode:",
                    orderCode
                );
                // Create new PaymentHistory if not exists
                const newPaymentHistory = new PaymentHistory({
                    orderCode: parseInt(orderCode),
                    status: "PAID",
                    amount: paymentData.amount || course.price,
                    description: `Payment for course: ${course.title}`,
                    courseId: courseId,
                    userId: userId,
                    courseName: course.title,
                    userEmail: user?.email,
                    userFullName: user?.fullName,
                    paymentMethod: "qr_code",
                    paidAt: new Date(),
                    createdAt: new Date(),
                });
                await newPaymentHistory.save();
                console.log("✅ New PaymentHistory created");
            }
        } catch (error) {
            console.error("❌ Error updating PaymentHistory:", error);
            // Don't fail the whole process if PaymentHistory update fails
        }

        if (user && user.email) {
            // Chuẩn bị thông tin để gửi email
            const paymentInfo = {
                userEmail: user.email,
                courseName: course.title,
                courseId: courseId,
                amount: paymentData.amount || course.price,
                paymentDate: new Date(),
                orderCode: orderCode,
            };

            // Gửi email thông báo thanh toán thành công (không chờ để không block response)
            emailService
                .sendPaymentSuccessEmail(paymentInfo)
                .then((emailResult: any) => {
                    if (emailResult.success) {
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
                .catch((emailError: any) => {
                    console.error(
                        `❌ Lỗi gửi email tới ${user.email}:`,
                        emailError
                    );
                });
        }

        return res.json({
            success: true,
            message: "Thanh toán thành công! Bạn đã được đăng ký khóa học.",
            data: {
                courseId: course._id,
                courseName: course.title,
                enrolledAt: newEnrollment.enrolledAt,
                orderCode: orderCode,
            },
        });
    } catch (error: any) {
        console.error("❌ Lỗi xử lý PayOS payment success:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xử lý thanh toán",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

// Generate audio for a specific word in a course
export const generateWordAudio = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // course ID
        const { wordIndex } = req.body;

        if (wordIndex === undefined || wordIndex < 0) {
            return res.status(400).json({
                success: false,
                message: "Word index is required",
            });
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Khóa học không tồn tại",
            });
        }

        if (course.type !== 'vocabulary') {
            return res.status(400).json({
                success: false,
                message: "Chỉ có thể tạo audio cho khóa học từ vựng",
            });
        }

        if (!course.vocabulary || wordIndex >= course.vocabulary.length) {
            return res.status(400).json({
                success: false,
                message: "Word index không hợp lệ",
            });
        }

        const word = course.vocabulary[wordIndex].word;
        if (!word) {
            return res.status(400).json({
                success: false,
                message: "Từ vựng không có nội dung",
            });
        }

        console.log(`🔊 Generating audio for word "${word}" in course "${course.title}"`);

        // Generate audio
        const audioUrl = await aiCourseGeneratorService.generateAudioForWord(word);

        // Update course with new audio URL
        course.vocabulary[wordIndex].audioUrl = audioUrl;
        await course.save();

        // Kiểm tra xem response đã được gửi chưa
        if (res.headersSent) {
            console.log('⚠️ Response already sent (timeout), skipping final response');
            return;
        }

        return res.json({
            success: true,
            audioUrl,
            message: `Đã tạo audio cho từ "${word}"`,
        });
    } catch (error: any) {
        console.error("❌ Error generating word audio:", error);
        
        // Kiểm tra xem response đã được gửi chưa
        if (res.headersSent) {
            console.log('⚠️ Response already sent, skipping error response');
            return;
        }
        
        return res.status(500).json({
            success: false,
            message: "Lỗi khi tạo audio",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

// Generate audio for all words in a vocabulary course
export const generateAllAudio = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // course ID

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Khóa học không tồn tại",
            });
        }

        if (course.type !== 'vocabulary') {
            return res.status(400).json({
                success: false,
                message: "Chỉ có thể tạo audio cho khóa học từ vựng",
            });
        }

        if (!course.vocabulary || course.vocabulary.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Khóa học không có từ vựng nào",
            });
        }

        console.log(`🔊 Generating audio for all ${course.vocabulary.length} words in course "${course.title}"`);

        let successCount = 0;
        let failCount = 0;

        // Generate audio for each word
        for (let i = 0; i < course.vocabulary.length; i++) {
            const vocab = course.vocabulary[i];
            
            // Skip if already has audio
            if (vocab.audioUrl) {
                console.log(`⏭️ [${i + 1}/${course.vocabulary.length}] Skipping "${vocab.word}" (already has audio)`);
                continue;
            }

            if (!vocab.word) {
                console.log(`⏭️ [${i + 1}/${course.vocabulary.length}] Skipping empty word`);
                continue;
            }

            try {
                const audioUrl = await aiCourseGeneratorService.generateAudioForWord(vocab.word);
                course.vocabulary[i].audioUrl = audioUrl;
                successCount++;
                console.log(`✅ [${i + 1}/${course.vocabulary.length}] Generated audio for "${vocab.word}"`);
            } catch (error) {
                failCount++;
                console.error(`❌ [${i + 1}/${course.vocabulary.length}] Failed to generate audio for "${vocab.word}":`, error);
            }
        }

        // Save updated course
        await course.save();

        // Kiểm tra xem response đã được gửi chưa (do timeout)
        if (res.headersSent) {
            console.log('⚠️ Response already sent (timeout), skipping final response');
            return;
        }

        return res.json({
            success: true,
            course,
            generatedCount: successCount,
            failedCount: failCount,
            totalWords: course.vocabulary.length,
            message: `Đã tạo audio cho ${successCount}/${course.vocabulary.length} từ vựng`,
        });
    } catch (error: any) {
        console.error("❌ Error generating all audio:", error);
        
        // Kiểm tra xem response đã được gửi chưa
        if (res.headersSent) {
            console.log('⚠️ Response already sent, skipping error response');
            return;
        }
        
        return res.status(500).json({
            success: false,
            message: "Lỗi khi tạo audio",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
