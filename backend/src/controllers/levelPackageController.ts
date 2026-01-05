import { Request, Response } from 'express';
import LevelPackage from '../models/LevelPackage';
import Course from '../models/Course';

/**
 * Lấy tất cả level packages (A1-C2)
 */
export const getAllLevelPackages = async (req: Request, res: Response) => {
  try {
    const packages = await LevelPackage.find({ status: 'active' })
      .sort({ level: 1 })
      .lean();

    // Tính toán statistics cho mỗi level
    for (const pkg of packages) {
      const courses = await Course.find({ 
        level: pkg.level, 
        isPublic: true 
      });

      pkg.totalCourses = courses.length;
      pkg.totalVocabulary = courses.filter(c => c.type === 'vocabulary').length;
      pkg.totalGrammar = courses.filter(c => c.type === 'grammar').length;
    }

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Get all level packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách level packages'
    });
  }
};

/**
 * Lấy chi tiết một level package kèm courses
 */
export const getLevelPackageDetail = async (req: Request, res: Response) => {
  try {
    const { level } = req.params;

    const levelPackage = await LevelPackage.findOne({ level, status: 'active' });
    if (!levelPackage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy level package'
      });
    }

    // Lấy tất cả courses trong level (chỉ public)
    const courses = await Course.find({ 
      level, 
      isPublic: true 
    })
      .select('_id title description type duration lessonsCount thumbnail instructor')
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // Update statistics
    levelPackage.totalCourses = courses.length;
    levelPackage.totalVocabulary = courses.filter(c => c.type === 'vocabulary').length;
    levelPackage.totalGrammar = courses.filter(c => c.type === 'grammar').length;

    return res.json({
      success: true,
      data: {
        package: levelPackage,
        courses: courses
      }
    });
  } catch (error) {
    console.error('Get level package detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết level package'
    });
  }
};

/**
 * Admin: Cập nhật thông tin level package (giá, mô tả)
 */
export const updateLevelPackage = async (req: Request, res: Response) => {
  try {
    const { level } = req.params;
    const updateData = req.body;

    // Không cho phép update level, userId, enrolledAt
    delete updateData.level;
    delete updateData.totalCourses;
    delete updateData.studentsCount;

    const levelPackage = await LevelPackage.findOneAndUpdate(
      { level },
      updateData,
      { new: true, runValidators: true }
    );

    if (!levelPackage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy level package'
      });
    }

    return res.json({
      success: true,
      message: 'Cập nhật level package thành công',
      data: levelPackage
    });
  } catch (error) {
    console.error('Update level package error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật level package'
    });
  }
};

/**
 * Admin: Lấy statistics của level package
 */
export const getLevelPackageStats = async (req: Request, res: Response) => {
  try {
    const stats = await Promise.all(
      ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(async (level) => {
        const pkg = await LevelPackage.findOne({ level });
        const courses = await Course.countDocuments({ level, isPublic: true });
        
        return {
          level,
          totalCourses: courses,
          studentsCount: pkg?.studentsCount || 0,
          price: pkg?.price || 0
        };
      })
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get level package stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy statistics'
    });
  }
};
