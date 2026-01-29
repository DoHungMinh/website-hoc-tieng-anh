import { Request, Response } from 'express';
import { IELTSExam } from '../models/IELTSExam';
import IELTSTestResult from '../models/IELTSTestResult';
import { User } from '../models/User';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';
import { calculateUserLevel } from '../utils/levelCalculator';
import { calculateIELTSScore } from '../utils/ieltsScoring';

// Function to update user level based on test results
const updateUserLevelFromTestResults = async (userId: string) => {
  try {
    // Get all test results for this user
    const testResults = await IELTSTestResult.find({ userId }).lean();

    // Calculate the appropriate level based on test results
    const newLevel = calculateUserLevel(testResults.map(result => ({ bandScore: result.score.bandScore })));

    // Update user's level in database
    await User.findByIdAndUpdate(userId, { level: newLevel }, { validateModifiedOnly: true });

    console.log(`📈 Updated user ${userId} level to: ${newLevel}`);
  } catch (error) {
    console.error('Error updating user level from test results:', error);
  }
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, filename: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        public_id: `ielts-audio/${filename}`,
        format: 'mp3',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// Get all IELTS exams with filtering
export const getIELTSExams = async (req: Request, res: Response) => {
  try {
    const {
      type,
      difficulty,
      status = 'published',
      page = 1,
      limit = 10,
      search
    } = req.query;

    console.log('getIELTSExams called with params:', { type, difficulty, status, page, limit, search });

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter object with input validation
    const filter: any = {};

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (difficulty && difficulty !== 'all' && typeof difficulty === 'string') {
      // Sanitize difficulty input
      const sanitizedDifficulty = difficulty.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.difficulty = { $regex: sanitizedDifficulty, $options: 'i' };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      // Sanitize search input
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: sanitizedSearch, $options: 'i' };
    }

    console.log('Filter object:', filter);

    const exams = await IELTSExam.find(filter)
      .populate({
        path: 'createdBy',
        select: 'fullName email',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .maxTimeMS(15000) // 15 second timeout
      .lean();

    const total = await IELTSExam.countDocuments(filter).maxTimeMS(10000);

    console.log(`Found ${exams.length} exams out of ${total} total`);

    // Filter out any null/undefined createdBy references
    const validExams = exams.map(exam => ({
      ...exam,
      createdBy: exam.createdBy || null
    }));

    res.json({
      success: true,
      data: validExams,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: total
      }
    });
  } catch (error: any) {
    console.error('Error fetching IELTS exams:', error);
    console.error('Error details:', error);

    // Handle timeout errors
    if (error.code === 50 || error.message?.includes('timeout')) {
      res.status(504).json({
        success: false,
        message: 'Truy vấn mất quá nhiều thời gian, vui lòng thử lại'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đề thi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get single IELTS exam by ID
export const getIELTSExamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exam = await IELTSExam.findById(id)
      .populate({
        path: 'createdBy',
        select: 'fullName email',
        options: { strictPopulate: false }
      })
      .lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi'
      });
    }

    // Ensure createdBy is not undefined
    const examData = {
      ...exam,
      createdBy: exam.createdBy || null
    };

    return res.json({
      success: true,
      data: examData
    });
  } catch (error) {
    console.error('Error fetching IELTS exam:', error);
    console.error('Error details:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin đề thi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create new IELTS exam
export const createIELTSExam = async (req: Request, res: Response) => {
  try {
    const {
      title,
      type,
      difficulty,
      duration,
      description,
      passages,
      sections
    } = req.body;

    console.log('Received exam data:', {
      title,
      type,
      difficulty,
      duration,
      description,
      passagesLength: passages?.length,
      sectionsLength: sections?.length,
      userId: req.user?.id
    });

    // Validate required fields
    if (!title || !type || !difficulty || !duration) {
      console.log('Validation failed - missing required fields:', { title, type, difficulty, duration });
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Validate user
    if (!req.user?.id) {
      console.log('User not authenticated');
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng'
      });
    }

    // Calculate total questions
    let totalQuestions = 0;

    // If totalQuestions is provided in request body (from AI generation), use it
    // Otherwise calculate from passages/sections
    if (req.body.totalQuestions && typeof req.body.totalQuestions === 'number') {
      totalQuestions = req.body.totalQuestions;
      console.log('Using provided totalQuestions:', totalQuestions);
    } else if (type === 'reading' && passages) {
      totalQuestions = passages.reduce((total: number, passage: any) =>
        total + (passage.questions ? passage.questions.length : 0), 0);
      console.log('Calculated totalQuestions from passages:', totalQuestions);
    } else if (type === 'listening' && sections) {
      totalQuestions = sections.reduce((total: number, section: any) =>
        total + (section.questions ? section.questions.length : 0), 0);
      console.log('Calculated totalQuestions from sections:', totalQuestions);
    }

    console.log('Final calculated total questions:', totalQuestions);

    // Create exam object
    const examData = {
      title,
      type,
      difficulty,
      duration,
      totalQuestions,
      description,
      passages: type === 'reading' ? passages : undefined,
      sections: type === 'listening' ? sections : undefined,
      createdBy: req.user.id,
      status: 'published'  // Changed from 'draft' to 'published'
    };

    console.log('Creating exam with data:', examData);

    const exam = new IELTSExam(examData);
    const savedExam = await exam.save();

    console.log('Exam created successfully:', savedExam._id);

    return res.status(201).json({
      success: true,
      message: 'Tạo đề thi thành công',
      data: savedExam
    });
  } catch (error) {
    console.error('Error creating IELTS exam:', error);

    // Provide more detailed error information
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo đề thi',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đề thi',
      error: 'Unknown error'
    });
  }
};

// Upload audio for listening exam
export const uploadAudio = async (req: Request, res: Response) => {
  try {
    const { examId, sectionId } = req.body;

    // Validate file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file audio được tải lên'
      });
    }

    // Validate buffer has data (memoryStorage provides buffer)
    if (!req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File audio rỗng hoặc không hợp lệ'
      });
    }

    console.log('📤 Uploading audio to Cloudinary:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      bufferLength: req.file.buffer.length
    });

    // Upload to Cloudinary
    const filename = `${examId}_${sectionId}_${Date.now()}`;
    const result = await uploadToCloudinary(req.file.buffer, filename);

    console.log('✅ Audio uploaded successfully:', result.secure_url);

    return res.json({
      success: true,
      message: 'Upload audio thành công',
      data: {
        audioUrl: result.secure_url,
        audioPublicId: result.public_id
      }
    });
  } catch (error) {
    console.error('❌ Error uploading audio:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi upload audio',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update IELTS exam
export const updateIELTSExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Calculate total questions if passages/sections are updated
    if (updateData.passages || updateData.sections) {
      let totalQuestions = 0;
      if (updateData.type === 'reading' && updateData.passages) {
        totalQuestions = updateData.passages.reduce((total: number, passage: any) =>
          total + (passage.questions ? passage.questions.length : 0), 0);
      } else if (updateData.type === 'listening' && updateData.sections) {
        totalQuestions = updateData.sections.reduce((total: number, section: any) =>
          total + (section.questions ? section.questions.length : 0), 0);
      }
      updateData.totalQuestions = totalQuestions;
    }

    const exam = await IELTSExam.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi'
      });
    }

    return res.json({
      success: true,
      message: 'Cập nhật đề thi thành công',
      data: exam
    });
  } catch (error) {
    console.error('Error updating IELTS exam:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật đề thi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Publish/unpublish exam
export const toggleExamStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const exam = await IELTSExam.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi'
      });
    }

    return res.json({
      success: true,
      message: `${status === 'published' ? 'Xuất bản' : 'Ẩn'} đề thi thành công`,
      data: exam
    });
  } catch (error) {
    console.error('Error toggling exam status:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi thay đổi trạng thái đề thi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete IELTS exam
export const deleteIELTSExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exam = await IELTSExam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi'
      });
    }

    // Delete associated audio files from Cloudinary
    if (exam.type === 'listening' && exam.sections) {
      for (const section of exam.sections) {
        if (section.audioPublicId) {
          try {
            await cloudinary.uploader.destroy(section.audioPublicId, { resource_type: 'video' });
          } catch (error) {
            console.error('Error deleting audio from Cloudinary:', error);
          }
        }
      }
    }

    await IELTSExam.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Xóa đề thi thành công'
    });
  } catch (error) {
    console.error('Error deleting IELTS exam:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa đề thi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get exam statistics
export const getExamStats = async (req: Request, res: Response) => {
  try {
    const [totalExams, readingExams, listeningExams, publishedExams] = await Promise.all([
      IELTSExam.countDocuments(),
      IELTSExam.countDocuments({ type: 'reading' }),
      IELTSExam.countDocuments({ type: 'listening' }),
      IELTSExam.countDocuments({ status: 'published' })
    ]);

    res.json({
      success: true,
      data: {
        total: totalExams,
        reading: readingExams,
        listening: listeningExams,
        published: publishedExams,
        draft: totalExams - publishedExams
      }
    });
  } catch (error) {
    console.error('Error fetching exam stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê đề thi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Submit test result
export const submitTestResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const { answers, timeSpent } = req.body;

    // Get user from auth middleware
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để lưu kết quả'
      });
      return;
    }

    // Get exam info
    const exam = await IELTSExam.findById(examId);
    if (!exam) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi'
      });
      return;
    }

    // Calculate score by collecting all questions
    const allQuestions: any[] = [];
    if (exam.type === 'reading' && exam.passages) {
      exam.passages.forEach(passage => {
        allQuestions.push(...passage.questions);
      });
    } else if (exam.type === 'listening' && exam.sections) {
      exam.sections.forEach(section => {
        allQuestions.push(...section.questions);
      });
    }

    // Process answers and calculate score
    // IMPORTANT: Save ALL questions to database, not just answered ones
    const processedAnswers = [];
    let correctCount = 0;

    console.log('📊 [IELTS Submit] Starting to process answers...');
    console.log('📊 Total questions in exam:', allQuestions.length);
    console.log('📊 Answers received from frontend:', Object.keys(answers).length);

    // Loop through ALL questions in the exam
    for (const question of allQuestions) {
      let userAnswer = answers[question.id]; // undefined if not answered

      // Convert numeric index (0,1,2,3) to letter (A,B,C,D) if needed
      // This handles cases where frontend sends index instead of letter
      if (typeof userAnswer === 'number' && typeof question.correctAnswer === 'string') {
        const indexToLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        userAnswer = indexToLetter[userAnswer] || userAnswer;
        console.log(`🔄 Converted index ${answers[question.id]} to letter ${userAnswer}`);
      }

      // DEBUG: Log first 3 questions to check types
      if (processedAnswers.length < 3) {
        console.log(`🔍 Question ${processedAnswers.length + 1}:`, {
          questionId: question.id,
          originalUserAnswer: answers[question.id],
          convertedUserAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
          strictEqual: userAnswer === question.correctAnswer,
        });
      }

      const isCorrect = userAnswer !== undefined &&
        question.correctAnswer !== undefined &&
        userAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      processedAnswers.push({
        questionId: question.id,
        userAnswer: userAnswer !== undefined ? userAnswer : null, // Store null for unanswered
        correctAnswer: question.correctAnswer,
        isCorrect: !!isCorrect
      });
    }

    console.log('📊 Processed answers count:', processedAnswers.length);
    console.log('📊 Correct answers:', correctCount);
    console.log('📊 Sample processed answer:', processedAnswers[0]);

    // IMPORTANT: Always use 40 questions for IELTS standard scoring
    // Even if the exam has fewer questions (e.g., 13 for Part 1 practice)
    const totalQuestions = 40;

    // Calculate IELTS band score using official scoring system
    let bandScore: number | undefined;
    let description: string | undefined;

    if (exam.type === 'listening' || exam.type === 'reading') {
      const ieltsResult = calculateIELTSScore(exam.type, correctCount);
      bandScore = ieltsResult.bandScore;
      description = ieltsResult.description;
    }

    // Save result to database
    const testResult = new IELTSTestResult({
      userId,
      examId,
      examTitle: exam.title,
      examType: exam.type,
      answers: processedAnswers,
      score: {
        correctAnswers: correctCount,
        totalQuestions,
        bandScore,
        description
      },
      timeSpent,
      completedAt: new Date()
    });

    await testResult.save();

    console.log('✅ [IELTS Submit] Test result saved to database');
    console.log('📊 Saved result ID:', testResult._id);
    console.log('📊 Saved correctAnswers:', testResult.score.correctAnswers);
    console.log('📊 Saved totalQuestions:', testResult.score.totalQuestions);
    console.log('📊 Saved bandScore:', testResult.score.bandScore);
    console.log('📊 Saved answers count:', testResult.answers.length);

    // Update user level based on test results if bandScore is available
    if (bandScore && bandScore > 0) {
      await updateUserLevelFromTestResults(userId);
    }

    res.json({
      success: true,
      message: 'Kết quả đã được lưu thành công',
      data: {
        resultId: testResult._id,
        score: testResult.score,
        levelUpdated: bandScore && bandScore > 0
      }
    });

  } catch (error) {
    console.error('Error submitting test result:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lưu kết quả bài thi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
};

// Get user's test history
export const getUserTestHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
      return;
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const results = await IELTSTestResult.find({ userId })
      .sort({ completedAt: -1 })
      .limit(Number(limit))
      .skip(skip)
      .select('-answers'); // Exclude detailed answers for list view

    console.log('📋 [IELTS History] Found results:', results.length);
    if (results.length > 0) {
      console.log('📋 First result sample:');
      console.log('   - examTitle:', results[0].examTitle);
      console.log('   - correctAnswers:', results[0].score.correctAnswers);
      console.log('   - totalQuestions:', results[0].score.totalQuestions);
      console.log('   - bandScore:', results[0].score.bandScore);
    }

    const totalResults = await IELTSTestResult.countDocuments({ userId });

    res.json({
      success: true,
      data: results,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalResults / Number(limit)),
        totalResults,
        hasNext: skip + results.length < totalResults,
        hasPrev: Number(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching test history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử làm bài',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
};

// Get detailed test result
export const getTestResultDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resultId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
      return;
    }

    const result = await IELTSTestResult.findOne({
      _id: resultId,
      userId
    });

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy kết quả bài thi'
      });
      return;
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching test result detail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết kết quả',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
};
