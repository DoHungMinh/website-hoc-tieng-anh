import { Request, Response } from 'express';
import Course, { ICourse } from '../models/Course';

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
    
    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Tạo khóa học thành công',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo khóa học'
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
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Cập nhật khóa học thành công',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
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
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Xóa khóa học thành công'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
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
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: course
    });
  } catch (error) {
    console.error('Update course status error:', error);
    res.status(500).json({
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

    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê khóa học'
    });
  }
};
