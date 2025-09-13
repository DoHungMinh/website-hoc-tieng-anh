import { Request, Response } from 'express';
import Course, { ICourse } from '../models/Course';
import Enrollment from '../models/Enrollment';

// Import PayOS service
const payOSService = require('../../payos/payos-service');

// Get all courses with filters
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      type, 
      level, 
      status, 
      page = 1, 
      limit = 10 
    } = req.query;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type && type !== 'all') filter.type = type;
    if (level && level !== 'all') filter.level = level;
    if (status && status !== 'all') filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const courses = await Course.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: courses,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khóa học'
    });
  }
};

// Get public courses for users
export const getPublicCourses = async (req: Request, res: Response) => {
  try {
    const { type, level } = req.query;
    
    const filter: any = { status: 'active' };
    if (type && type !== 'all') filter.type = type;
    if (level && level !== 'all') filter.level = level;

    const courses = await Course.find(filter)
      .select('-vocabulary -grammar') // Exclude detailed content for public view
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get public courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khóa học'
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
        message: 'Không tìm thấy khóa học'
      });
      return;
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin khóa học'
    });
  }
};

// Create new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const courseData = req.body;
    
    // Validate required fields
    if (!courseData.title || !courseData.description || !courseData.type || 
        !courseData.level || !courseData.duration || !courseData.instructor) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Ensure price is a valid number
    if (typeof courseData.price !== 'number' || isNaN(courseData.price)) {
      courseData.price = 0;
    }

    const course = new Course(courseData);
    await course.save();

    return res.status(201).json({
      success: true,
      message: 'Tạo khóa học thành công',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo khóa học',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    return res.json({
      success: true,
      message: 'Cập nhật khóa học thành công',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật khóa học'
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
        message: 'Không tìm thấy khóa học'
      });
    }

    return res.json({
      success: true,
      message: 'Xóa khóa học thành công'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa khóa học'
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
        message: 'Không tìm thấy khóa học'
      });
    }

    return res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: course
    });
  } catch (error) {
    console.error('Update course status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái'
    });
  }
};

// Get course statistics
export const getCourseStats = async (req: Request, res: Response) => {
  try {
    const total = await Course.countDocuments();
    const active = await Course.countDocuments({ status: 'active' });
    const draft = await Course.countDocuments({ status: 'draft' });
    const archived = await Course.countDocuments({ status: 'archived' });
    const vocabulary = await Course.countDocuments({ type: 'vocabulary' });
    const grammar = await Course.countDocuments({ type: 'grammar' });

    return res.json({
      success: true,
      data: {
        total,
        active,
        draft,
        archived,
        vocabulary,
        grammar
      }
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê khóa học'
    });
  }
};

// Handle PayOS payment completion and course enrollment
export const handlePayOSPaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.body;
    const userId = (req as any).user?.id;

    console.log(`🎯 Xử lý thanh toán thành công PayOS: ${orderCode} cho user: ${userId}`);

    if (!orderCode) {
      return res.status(400).json({
        success: false,
        message: 'orderCode là bắt buộc'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng chưa đăng nhập'
      });
    }

    // Kiểm tra trạng thái payment từ PayOS
    const paymentStatus = await payOSService.getPaymentStatus(parseInt(orderCode));
    
    if (!paymentStatus.success || paymentStatus.status !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Thanh toán chưa được xác nhận hoặc chưa thành công'
      });
    }

    // Lấy thông tin payment để biết courseId
    const paymentData = paymentStatus.data;
    
    // Tìm course từ payment description hoặc từ stored data
    // Vì PayOS không lưu metadata, ta cần parse từ description
    const courseIdMatch = paymentData.description?.match(/course[_\s]*([a-fA-F0-9]{24})/i);
    let courseId = null;

    if (courseIdMatch) {
      courseId = courseIdMatch[1];
    } else {
      // Fallback: tìm course theo tên từ description
      const courseName = paymentData.description?.replace('Thanh toan khoa hoc: ', '');
      if (courseName) {
        const course = await Course.findOne({ title: { $regex: courseName, $options: 'i' } });
        courseId = course?._id;
      }
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xác định khóa học từ payment'
      });
    }

    // Kiểm tra course có tồn tại không
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Kiểm tra user đã đăng ký chưa
    const existingEnrollment = await Enrollment.findOne({
      userId: userId,
      courseId: courseId
    });

    if (existingEnrollment) {
      return res.json({
        success: true,
        message: 'Bạn đã được đăng ký khóa học này rồi',
        data: {
          courseId: course._id,
          courseName: course.title,
          enrolledAt: existingEnrollment.enrolledAt
        }
      });
    }

    // Tạo enrollment mới
    const newEnrollment = new Enrollment({
      userId: userId,
      courseId: courseId,
      enrolledAt: new Date(),
      status: 'active',
      progress: {
        completedLessons: [],
        completedVocabulary: [],
        completedGrammar: [],
        completionPercentage: 0
      },
      quiz: {
        attempts: 0,
        bestScore: 0
      },
      lastAccessedAt: new Date(),
      achievements: []
    });

    await newEnrollment.save();

    console.log(`✅ Đã tạo enrollment thành công cho user ${userId} - course ${courseId}`);

    return res.json({
      success: true,
      message: 'Thanh toán thành công! Bạn đã được đăng ký khóa học.',
      data: {
        courseId: course._id,
        courseName: course.title,
        enrolledAt: newEnrollment.enrolledAt,
        orderCode: orderCode
      }
    });

  } catch (error: any) {
    console.error('❌ Lỗi xử lý PayOS payment success:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xử lý thanh toán',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
