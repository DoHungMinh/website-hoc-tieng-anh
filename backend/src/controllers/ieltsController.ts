import { Request, Response } from 'express';
import { IELTSExam } from '../models/IELTSExam';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

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

    // Build filter object
    const filter: any = {};
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = { $regex: difficulty, $options: 'i' };
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    console.log('Filter object:', filter);

    const skip = (Number(page) - 1) * Number(limit);
    
    const exams = await IELTSExam.find(filter)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await IELTSExam.countDocuments(filter);
    
    console.log(`Found ${exams.length} exams out of ${total} total`);
    
    res.json({
      success: true,
      data: exams,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: total
      }
    });
  } catch (error) {
    console.error('Error fetching IELTS exams:', error);
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
    
    const exam = await IELTSExam.findById(id).populate('createdBy', 'fullName email');
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề thi'
      });
    }
    
    return res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error fetching IELTS exam:', error);
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
    if (type === 'reading' && passages) {
      totalQuestions = passages.reduce((total: number, passage: any) => 
        total + (passage.questions ? passage.questions.length : 0), 0);
    } else if (type === 'listening' && sections) {
      totalQuestions = sections.reduce((total: number, section: any) => 
        total + (section.questions ? section.questions.length : 0), 0);
    }

    console.log('Calculated total questions:', totalQuestions);

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
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file audio được tải lên'
      });
    }

    // Upload to Cloudinary
    const filename = `${examId}_${sectionId}_${Date.now()}`;
    const result = await uploadToCloudinary(req.file.buffer, filename);

    return res.json({
      success: true,
      message: 'Upload audio thành công',
      data: {
        audioUrl: result.secure_url,
        audioPublicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Error uploading audio:', error);
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
