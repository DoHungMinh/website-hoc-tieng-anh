import { Request, Response } from 'express';
import LevelEnrollment from '../models/LevelEnrollment';
import LevelPackage from '../models/LevelPackage';

/**
 * Lấy danh sách level enrollments của user
 */
export const getUserLevelEnrollments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const enrollments = await LevelEnrollment.find({ 
      userId,
      status: { $in: ['active', 'paused'] }
    })
      .sort({ enrolledAt: -1 })
      .lean();

    // Lấy thông tin level package cho mỗi enrollment
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const levelPackage = await LevelPackage.findOne({ level: enrollment.level });
        return {
          ...enrollment,
          packageInfo: levelPackage
        };
      })
    );

    return res.json({
      success: true,
      data: enrichedEnrollments,
      totalLevels: enrollments.length
    });
  } catch (error) {
    console.error('Get user level enrollments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách level enrollments'
    });
  }
};

/**
 * Kiểm tra user có enrolled trong level không
 */
export const checkLevelEnrollment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { level } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const enrollment = await LevelEnrollment.findOne({
      userId,
      level,
      status: { $in: ['active', 'paused'] }
    });

    return res.json({
      success: true,
      isEnrolled: !!enrollment,
      enrollment: enrollment || null
    });
  } catch (error) {
    console.error('Check level enrollment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra enrollment'
    });
  }
};

/**
 * Tạo level enrollment (internal use - được gọi từ payment success)
 */
export const createLevelEnrollment = async (
  userId: string,
  level: string,
  orderCode: number,
  paidAmount: number
) => {
  try {
    // Kiểm tra duplicate
    const existing = await LevelEnrollment.findOne({ userId, level });
    if (existing) {
      return {
        success: false,
        message: 'User đã enrolled trong level này rồi',
        enrollment: existing
      };
    }

    // Tạo enrollment mới
    const enrollment = await LevelEnrollment.create({
      userId,
      level,
      enrolledAt: new Date(),
      status: 'active',
      orderCode,
      paidAmount,
      paymentDate: new Date(),
      lastAccessedAt: new Date()
    });

    // Tăng studentsCount của level package
    await LevelPackage.findOneAndUpdate(
      { level },
      { $inc: { studentsCount: 1 } }
    );

    return {
      success: true,
      enrollment
    };
  } catch (error) {
    console.error('Create level enrollment error:', error);
    return {
      success: false,
      message: 'Lỗi khi tạo enrollment',
      error
    };
  }
};

/**
 * Update lastAccessedAt khi user học
 */
export const updateLastAccessed = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { level } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    await LevelEnrollment.findOneAndUpdate(
      { userId, level },
      { lastAccessedAt: new Date() }
    );

    return res.json({
      success: true,
      message: 'Updated last accessed'
    });
  } catch (error) {
    console.error('Update last accessed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật last accessed'
    });
  }
};
