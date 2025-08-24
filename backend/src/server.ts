import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('../config/database');

// Import routes
import authRoutes from './routes/auth';
import assessmentRoutes from './routes/assessment';
import chatbotRoutes from './routes/chatbot';
import learningRoutes from './routes/learning';
import progressRoutes from './routes/progress';
import userRoutes from './routes/user';
import ieltsRoutes from './routes/ielts';
import coursesRoutes from './routes/courses';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5174"
    ],
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true
}));

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'English Learning Platform API is running',
    timestamp: new Date().toISOString(),
    database: 'Connected to MongoDB Atlas'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ielts', ieltsRoutes);
app.use('/api/courses', coursesRoutes);

// Test database endpoint
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState;
    const statusMap: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      status: 'success',
      database: statusMap[dbStatus] || 'unknown',
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Create test user (GET for easy testing)
app.get('/api/create-test-user', async (req: Request, res: Response) => {
  try {
    const { User } = require('./models/User');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@english-learning.com' });
    
    if (existingUser) {
      res.json({
        status: 'success',
        message: 'Test user already exists',
        user: {
          id: existingUser._id,
          email: existingUser.email,
          fullName: existingUser.fullName,
          level: existingUser.level
        }
      });
      return;
    }

    // Create new test user
    const testUser = new User({
      email: 'test@english-learning.com',
      password: 'password123',
      fullName: 'Test User',
      level: 'A1',
      learningGoals: ['speaking', 'listening'],
      preferences: {
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        notifications: {
          email: true,
          push: true
        }
      }
    });

    const savedUser = await testUser.save();

    res.status(201).json({
      status: 'success',
      message: 'Test user created successfully - Check MongoDB Atlas Collections!',
      user: {
        id: savedUser._id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        level: savedUser.level,
        createdAt: savedUser.createdAt
      }
    });

  } catch (error: any) {
    console.error('❌ Create test user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create test user',
      error: error.message
    });
  }
});

// Socket.IO connection handling
io.on('connection', (socket: any) => {
  console.log('🔗 User connected:', socket.id);
  
  socket.on('join_room', (userId: string) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on('chat_message', async (data: any) => {
    try {
      // Here we'll implement AI chatbot logic later
      console.log('💬 Chat message:', data);
      
      // Echo response for now
      socket.emit('chat_response', {
        message: `Echo: ${data.message}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Chat error:', error);
      socket.emit('chat_error', { message: 'Chat service temporarily unavailable' });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 5003;

// Connect to database and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  })
  .catch((error: any) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
