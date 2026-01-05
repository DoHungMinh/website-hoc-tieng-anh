import { Request, Response, NextFunction } from 'express';
import LevelEnrollment from '../models/LevelEnrollment';
import Course from '../models/Course';

/**
 * Middleware kiểm tra user có quyền truy cập course không
 * Dựa trên level enrollment thay vì course enrollment
 */
export const checkLevelAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { courseId, id } = req.params;
    const targetCourseId = courseId || id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User chưa đăng nhập'
      });
    }

    if (!targetCourseId) {
      return res.status(400).json({
        success: false,
        message: 'CourseId is required'
      });
    }

    // Lấy thông tin course để biết level
    const course = await Course.findById(targetCourseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Kiểm tra course có public không (admin có thể đã xóa/ẩn)
    if (!course.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Khóa học này không còn khả dụng'
      });
    }

    // Kiểm tra user có enrolled trong level của course không
    const hasLevelAccess = await LevelEnrollment.findOne({
      userId,
      level: course.level,
      status: { $in: ['active', 'paused'] }
    });

    if (!hasLevelAccess) {
      return res.status(403).json({
        success: false,
        message: `Bạn cần mua Level ${course.level} Package để truy cập khóa học này`,
        requiredLevel: course.level,
        courseTitle: course.title
      });
    }

    // Update lastAccessedAt
    hasLevelAccess.lastAccessedAt = new Date();
    await hasLevelAccess.save();

    // Attach enrollment info to request
    (req as any).levelEnrollment = hasLevelAccess;
    (req as any).courseLevel = course.level;

    return next();
  } catch (error) {
    console.error('Check level access error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra quyền truy cập'
    });
  }
};

/**
 * Middleware kiểm tra user có enrolled trong level cụ thể không
 * Dùng cho các API không cần courseId
 */
export const checkSpecificLevelAccess = (requiredLevel: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User chưa đăng nhập'
        });
      }

      const hasAccess = await LevelEnrollment.findOne({
        userId,
        level: requiredLevel,
        status: { $in: ['active', 'paused'] }
      });

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `Bạn cần mua Level ${requiredLevel} Package để truy cập`,
          requiredLevel
        });
      }

      (req as any).levelEnrollment = hasAccess;
      return next();
    } catch (error) {
      console.error('Check specific level access error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra quyền truy cập'
      });
    }
  };
};
