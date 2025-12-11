import { Request, Response } from 'express';
import { User } from '../models/User';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../services/imageUploadService';

// Get all users with pagination and filters
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '', 
      accountStatus = '',
      onlineStatus = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Validate and sanitize pagination inputs
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10)); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // Build query with input sanitization
    const query: any = {};
    
    if (search && typeof search === 'string' && search.trim()) {
      // Escape regex special characters to prevent ReDoS attacks
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { fullName: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all' && ['student', 'admin', 'instructor'].includes(role as string)) {
      query.role = role;
    }
    
    if (accountStatus && accountStatus !== 'all' && ['active', 'disabled'].includes(accountStatus as string)) {
      query.accountStatus = accountStatus;
    }
    
    if (onlineStatus && onlineStatus !== 'all') {
      if (onlineStatus === 'online') {
        query.isOnline = true;
      } else if (onlineStatus === 'offline') {
        query.isOnline = false;
      }
    }

    // Validate sortBy to prevent NoSQL injection
    const allowedSortFields = ['createdAt', 'fullName', 'email', 'lastSeen'];
    const validSortBy = allowedSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';
    const validSortOrder = sortOrder === 'asc' ? 1 : -1;

    // Get users with pagination and timeout protection
    const users = await User.find(query)
      .select('-password')
      .sort({ [validSortBy]: validSortOrder })
      .skip(skip)
      .limit(limitNum)
      .maxTimeMS(10000) // 10 second timeout to prevent long-running queries
      .lean(); // Use lean() for better performance

    // Get total count with timeout
    const total = await User.countDocuments(query).maxTimeMS(5000);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      res.status(504).json({
        success: false,
        message: 'Yêu cầu quá lâu, vui lòng thử lại'
      });
      return;
    }
    
    if (error.code === 50) { // MongoDB execution timeout
      res.status(504).json({
        success: false,
        message: 'Truy vấn mất quá nhiều thời gian, vui lòng thu hẹp bộ lọc'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách người dùng'
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin người dùng'
    });
  }
};

// Update user account status
export const updateAccountStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;

    if (!['active', 'disabled'].includes(accountStatus)) {
      res.status(400).json({
        success: false,
        message: 'Trạng thái tài khoản không hợp lệ'
      });
      return;
    }

    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
      return;
    }

    // Prevent admin from disabling their own account
    if (req.user?._id === id && accountStatus === 'disabled') {
      res.status(400).json({
        success: false,
        message: 'Không thể vô hiệu hóa tài khoản của chính mình'
      });
      return;
    }

    user.accountStatus = accountStatus;
    await user.save({ validateModifiedOnly: true });

    res.json({
      success: true,
      message: `Đã ${accountStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản thành công`,
      data: {
        id: user._id,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Update account status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái tài khoản'
    });
  }
};

// Update user online status
export const updateOnlineStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isOnline } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
      return;
    }

    user.isOnline = isOnline;
    user.lastSeen = new Date();
    await user.save({ validateModifiedOnly: true });

    res.json({
      success: true,
      message: 'Đã cập nhật trạng thái online thành công',
      data: {
        id: user._id,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái online'
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting their own account
    if (req.user?._id === id) {
      res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản của chính mình'
      });
      return;
    }

    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
      return;
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Đã xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa người dùng'
    });
  }
};

// Create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, phone, role = 'user', level = 'A1' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
      return;
    }

    // Create new user
    const user = new User({
      email,
      password,
      fullName,
      phone,
      role,
      level,
      accountStatus: 'active',
      isOnline: false
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Đã tạo người dùng thành công',
      data: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo người dùng'
    });
  }
};

// Update user info
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, phone, role, level, password } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
      return;
    }

    // Update user info
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (level) user.level = level;
    
    // Update password if provided (admin can change without current password)
    if (password) {
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Mật khẩu phải có ít nhất 6 ký tự'
        });
        return;
      }
      user.password = password;
    }

    await user.save({ validateModifiedOnly: true });

    res.json({
      success: true,
      message: 'Đã cập nhật thông tin người dùng thành công',
      data: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật thông tin người dùng'
    });
  }
};

// Get user statistics
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    // Active users = tất cả users trừ những user bị disabled
    const activeUsers = await User.countDocuments({ 
      accountStatus: { $ne: 'disabled' } 
    });
    const disabledUsers = await User.countDocuments({ accountStatus: 'disabled' });
    const onlineUsers = await User.countDocuments({ isOnline: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        disabledUsers,
        onlineUsers,
        adminUsers,
        regularUsers,
        newUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê người dùng'
    });
  }
};

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const file = req.file;
    const currentUser = req.user;

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh để upload'
      });
      return;
    }

    // Check authorization - user can only upload their own avatar, or admin can upload for anyone
    if (currentUser?.role !== 'admin' && currentUser?._id.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể upload ảnh đại diện cho chính mình'
      });
      return;
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
      return;
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const publicId = extractPublicId(user.avatar);
      if (publicId) {
        await deleteFromCloudinary(`avatars/${publicId}`);
      }
    }

    // Upload new avatar to Cloudinary
    const avatarUrl = await uploadToCloudinary(file.buffer, 'avatars', `user_${userId}`);

    // Update user's avatar
    user.avatar = avatarUrl;
    await user.save({ validateModifiedOnly: true });

    res.json({
      success: true,
      message: 'Upload ảnh đại diện thành công',
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload ảnh đại diện'
    });
  }
};

// Delete avatar
export const deleteAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Check authorization - user can only delete their own avatar, or admin can delete for anyone
    if (currentUser?.role !== 'admin' && currentUser?._id.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể xóa ảnh đại diện của chính mình'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
      return;
    }

    // Delete avatar from Cloudinary if exists
    if (user.avatar) {
      const publicId = extractPublicId(user.avatar);
      if (publicId) {
        await deleteFromCloudinary(`avatars/${publicId}`);
      }
    }

    // Remove avatar from user
    user.avatar = undefined;
    await user.save({ validateModifiedOnly: true });

    res.json({
      success: true,
      message: 'Xóa ảnh đại diện thành công'
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa ảnh đại diện'
    });
  }
};
