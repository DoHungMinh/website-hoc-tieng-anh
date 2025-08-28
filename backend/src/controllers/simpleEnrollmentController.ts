import { Request, Response } from 'express';

// Mock data cho testing
const mockEnrollments = [
  {
    _id: "enrollment1",
    userId: "user123",
    courseId: {
      _id: "course1",
      title: "Tiếng Anh Giao Tiếp Cơ Bản",
      description: "Khóa học tiếng Anh giao tiếp dành cho người mới bắt đầu. Học cách giao tiếp trong các tình huống hàng ngày.",
      type: "speaking",
      level: "Beginner",
      duration: "8 tuần",
      instructor: "Ms. Sarah Johnson",
      lessonsCount: 24,
      thumbnail: "/images/course1.jpg",
      studentsCount: 156
    },
    status: "active",
    progress: {
      completedLessons: ["lesson1", "lesson2", "lesson3"],
      completedVocabulary: ["vocab1", "vocab2"],
      completedGrammar: ["grammar1"],
      completionPercentage: 35
    },
    quiz: {
      attempts: 2,
      bestScore: 85
    },
    enrolledAt: "2024-01-15T08:00:00.000Z",
    lastAccessedAt: "2024-01-25T14:30:00.000Z"
  },
  {
    _id: "enrollment2",
    userId: "user123",
    courseId: {
      _id: "course2",
      title: "Ngữ Pháp Tiếng Anh Nâng Cao",
      description: "Nắm vững các cấu trúc ngữ pháp phức tạp và cách sử dụng trong giao tiếp và viết.",
      type: "grammar",
      level: "Advanced",
      duration: "12 tuần",
      instructor: "Prof. Michael Brown",
      lessonsCount: 36,
      thumbnail: "/images/course2.jpg",
      studentsCount: 89
    },
    status: "active",
    progress: {
      completedLessons: ["lesson1", "lesson2"],
      completedVocabulary: ["vocab1"],
      completedGrammar: ["grammar1", "grammar2", "grammar3"],
      completionPercentage: 15
    },
    quiz: {
      attempts: 1,
      bestScore: 72
    },
    enrolledAt: "2024-02-01T10:00:00.000Z",
    lastAccessedAt: "2024-02-05T16:45:00.000Z"
  },
  {
    _id: "enrollment3",
    userId: "user123",
    courseId: {
      _id: "course3",
      title: "IELTS Writing Task 2",
      description: "Hoàn thành khóa học viết IELTS với điểm số cao. Học các kỹ thuật viết hiệu quả.",
      type: "writing",
      level: "Intermediate",
      duration: "6 tuần",
      instructor: "Dr. Emma Wilson",
      lessonsCount: 18,
      thumbnail: "/images/course3.jpg",
      studentsCount: 234
    },
    status: "completed",
    progress: {
      completedLessons: Array.from({length: 18}, (_, i) => `lesson${i+1}`),
      completedVocabulary: Array.from({length: 12}, (_, i) => `vocab${i+1}`),
      completedGrammar: Array.from({length: 8}, (_, i) => `grammar${i+1}`),
      completionPercentage: 100
    },
    quiz: {
      attempts: 3,
      bestScore: 94
    },
    enrolledAt: "2023-12-01T09:00:00.000Z",
    lastAccessedAt: "2024-01-10T12:00:00.000Z"
  }
];

export const getUserEnrollments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Trong thực tế sẽ query từ database
    // const enrollments = await Enrollment.find({ userId }).populate('courseId');
    
    // Tạm thời dùng mock data
    const userEnrollments = mockEnrollments.filter(enrollment => 
      enrollment.userId === userId || true // Cho phép tất cả user xem để test
    );

    const totalCourses = userEnrollments.length;
    const activeCourses = userEnrollments.filter(e => e.status === 'active').length;
    const completedCourses = userEnrollments.filter(e => e.status === 'completed').length;
    
    // Tính toán tiến độ tổng thể
    const overallProgress = totalCourses > 0 
      ? Math.round(userEnrollments.reduce((sum, enrollment) => 
          sum + enrollment.progress.completionPercentage, 0) / totalCourses)
      : 0;

    res.json({
      enrollments: userEnrollments,
      totalCourses,
      activeCourses,
      completedCourses,
      overallProgress
    });

  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const enrollInCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!courseId) {
      res.status(400).json({ message: 'Course ID is required' });
      return;
    }

    // Tạm thời trả về success để test enrollment
    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment: {
        _id: `enrollment_${Date.now()}`,
        userId,
        courseId,
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
        enrolledAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
