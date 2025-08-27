import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { setUserOffline } from '../middleware/userActivity';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Generate JWT token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  
  return jwt.sign({ userId }, secret as string, { expiresIn } as jwt.SignOptions);
};

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng'
      });
      return;
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      phone,
      password,
      role: 'user' // Force user role for registration
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký'
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
      return;
    }

    // Check if account is disabled
    if (user.accountStatus === 'disabled') {
      res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ admin.'
      });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
      return;
    }

    // Update user online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateModifiedOnly: true });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: user.role === 'admin' ? 'Đăng nhập admin thành công' : 'Đăng nhập thành công',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        level: user.level,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (req.user && req.user._id) {
      // Set user offline
      await setUserOffline(req.user._id);
    }

    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng xuất'
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

export default router;
