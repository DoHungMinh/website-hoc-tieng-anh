import React, { useState } from 'react';
import CoursesPage from './CoursesPage';
import CourseDetail from './CourseDetail';
import { courseAPI, Course } from '../services/courseAPI';

// Import DetailCourse type từ CourseDetail
type DetailCourse = {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  price: number;
  originalPrice?: number;
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  description: string;
  features: string[];
  curriculum: {
    module: string;
    lessons: string[];
  }[];
  instructor: {
    name: string;
    title: string;
    experience: string;
    avatar: string;
  };
  whatYouLearn: string[];
  requirements: string[];
  isPopular?: boolean;
  vocabulary?: Array<{
    id: string;
    word: string;
    pronunciation?: string;
    meaning: string;
    example?: string;
  }>;
  grammar?: Array<{
    id: string;
    rule: string;
    structure?: string;
    explanation: string;
    example: string;
  }>;
};

type ViewType = 'main' | 'vocabulary' | 'grammar' | 'detail';

interface CourseAppProps {
  onBack?: () => void;
}

const CourseApp: React.FC<CourseAppProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [purchasedCourses, setPurchasedCourses] = useState<Set<string>>(new Set()); // Track purchased courses

  const handleCourseTypeSelect = (type: 'vocabulary' | 'grammar') => {
    setCurrentView(type);
  };

  const handleCourseSelect = async (courseId: string) => {
    try {
      const response = await courseAPI.getPublicCourseById(courseId);
      if (response.success) {
        setSelectedCourse(response.data);
        setCurrentView('detail');
      }
    } catch (error) {
      console.error('Error loading course details:', error);
      alert('Không thể tải thông tin khóa học');
    }
  };

  const handleBack = () => {
    if (currentView === 'detail') {
      setCurrentView(selectedCourse?.type || 'main');
      setSelectedCourse(null);
    } else if (currentView === 'main') {
      onBack?.(); // Back to homepage
    } else {
      setCurrentView('main');
    }
  };

  const handleEnroll = async (courseId: string) => {
    // Simulate purchase confirmation
    const confirmPurchase = window.confirm(
      `Bạn có muốn mua khóa học này với giá ${selectedCourse?.price?.toLocaleString('vi-VN')}đ?\n\n` +
      `Sau khi mua thành công, bạn sẽ có thể truy cập toàn bộ nội dung khóa học.\n\n` +
      `(Đây là demo - không thực sự thanh toán)`
    );
    
    if (confirmPurchase) {
      // Simulate successful purchase
      setPurchasedCourses(prev => new Set(prev).add(courseId));
      alert('🎉 Chúc mừng! Bạn đã mua khóa học thành công!\n\nBây giờ bạn có thể truy cập toàn bộ nội dung khóa học.');
    }
    // TODO: Implement real payment flow
  };

  // Generate content based on course level and type
  const generateWhatYouLearn = (level: string, type: string): string[] => {
    const baseSkills = {
      vocabulary: {
        'A1': [
          'Học 200+ từ vựng cơ bản thường ngày',
          'Phát âm chính xác các từ vựng cơ bản',
          'Sử dụng từ vựng trong giao tiếp hàng ngày',
          'Nhận biết và hiểu từ vựng qua ngữ cảnh đơn giản'
        ],
        'A2': [
          'Mở rộng vốn từ vựng lên 500+ từ',
          'Sử dụng từ vựng để mô tả hoạt động hàng ngày',
          'Kết hợp từ vựng để tạo câu phức tạp hơn',
          'Hiểu nghĩa từ vựng qua ngữ cảnh'
        ],
        'B1': [
          'Nắm vững 1000+ từ vựng đa dạng chủ đề',
          'Sử dụng từ vựng chuyên ngành cơ bản',
          'Phân biệt sắc thái nghĩa của từ vựng',
          'Áp dụng từ vựng trong writing và speaking'
        ],
        'B2': [
          'Làm chủ 1500+ từ vựng nâng cao',
          'Sử dụng idioms và phrases thông dụng',
          'Hiểu từ vựng academic và formal',
          'Vận dụng từ vựng để diễn đạt ý tưởng phức tạp'
        ],
        'C1': [
          'Thành thạo 2000+ từ vựng chuyên sâu',
          'Sử dụng từ vựng academic một cách tự nhiên',
          'Hiểu và dùng collocation chính xác',
          'Diễn đạt ý tưởng với từ vựng tinh tế và chính xác'
        ],
        'C2': [
          'Nắm vững 3000+ từ vựng đa dạng lĩnh vực',
          'Sử dụng từ vựng như người bản ngữ',
          'Hiểu và vận dụng từ vựng chuyên ngành sâu',
          'Thể hiện sự tinh tế trong lựa chọn từ ngữ'
        ]
      },
      grammar: {
        'A1': [
          'Sử dụng thì hiện tại đơn và hiện tại tiếp diễn',
          'Tạo câu khẳng định, phủ định và nghi vấn cơ bản',
          'Sử dụng động từ "to be" và "have" chính xác',
          'Hiểu cấu trúc câu đơn giản'
        ],
        'A2': [
          'Nắm vững các thì quá khứ đơn và tương lai đơn',
          'Sử dụng modal verbs cơ bản (can, must, should)',
          'Tạo câu ghép đơn giản với "and", "but", "or"',
          'Hiểu và dùng prepositions thông dụng'
        ],
        'B1': [
          'Thành thạo perfect tenses (hiện tại hoàn thành)',
          'Sử dụng passive voice trong các tình huống cơ bản',
          'Tạo câu phức với các mệnh đề phụ',
          'Hiểu và dùng conditional sentences loại 1'
        ],
        'B2': [
          'Làm chủ tất cả các thì tiếng Anh',
          'Sử dụng reported speech thành thạo',
          'Tạo câu phức tạp với nhiều mệnh đề',
          'Hiểu và dùng conditional sentences loại 2, 3'
        ],
        'C1': [
          'Sử dụng cấu trúc ngữ pháp nâng cao một cách tự nhiên',
          'Hiểu và vận dụng inversion, emphasis structures',
          'Sử dụng subjunctive mood chính xác',
          'Tạo văn bản với cấu trúc ngữ pháp đa dạng'
        ],
        'C2': [
          'Thành thạo tất cả cấu trúc ngữ pháp tiếng Anh',
          'Sử dụng ngữ pháp như người bản ngữ',
          'Hiểu và vận dụng cấu trúc formal và informal',
          'Thể hiện sự tinh tế trong cách diễn đạt'
        ]
      }
    };

    return baseSkills[type as keyof typeof baseSkills]?.[level as keyof typeof baseSkills.vocabulary] || [
      'Nâng cao kỹ năng tiếng Anh của bạn',
      'Học từ vựng và ngữ pháp thực tế',
      'Áp dụng kiến thức vào giao tiếp',
      'Chuẩn bị cho các kỳ thi quốc tế'
    ];
  };

  const generateCurriculum = (level: string, type: string): Array<{module: string; lessons: string[]}> => {
    const curriculumTemplates = {
      vocabulary: {
        'A1': [
          { module: 'Từ vựng cơ bản', lessons: ['Gia đình và bạn bè', 'Màu sắc và số đếm', 'Thực phẩm và đồ uống', 'Quần áo và phụ kiện'] },
          { module: 'Hoạt động hàng ngày', lessons: ['Thời gian và lịch trình', 'Giao thông và di chuyển', 'Mua sắm cơ bản', 'Sở thích và giải trí'] }
        ],
        'A2': [
          { module: 'Mở rộng từ vựng', lessons: ['Công việc và nghề nghiệp', 'Sức khỏe và cơ thể', 'Thời tiết và môi trường', 'Giáo dục và học tập'] },
          { module: 'Giao tiếp xã hội', lessons: ['Mời gọi và từ chối', 'Ý kiến và cảm xúc', 'So sánh và đối chiếu', 'Kế hoạch tương lai'] }
        ],
        'B1': [
          { module: 'Từ vựng đa dạng', lessons: ['Công nghệ và internet', 'Du lịch và văn hóa', 'Kinh doanh cơ bản', 'Môi trường và bảo vệ'] },
          { module: 'Kỹ năng giao tiếp', lessons: ['Thuyết trình đơn giản', 'Thảo luận nhóm', 'Viết email chính thức', 'Phỏng vấn cơ bản'] }
        ],
        'B2': [
          { module: 'Từ vựng nâng cao', lessons: ['Khoa học và kỹ thuật', 'Chính trị và xã hội', 'Nghệ thuật và văn hóa', 'Kinh tế và tài chính'] },
          { module: 'Ứng dụng thực tế', lessons: ['Presentation chuyên nghiệp', 'Negotiation skills', 'Academic writing', 'Critical thinking'] }
        ],
        'C1': [
          { module: 'Từ vựng chuyên sâu', lessons: ['Academic vocabulary', 'Professional terminology', 'Idioms và expressions', 'Formal vs informal language'] },
          { module: 'Thành thạo giao tiếp', lessons: ['Advanced presentation', 'Debate và discussion', 'Research writing', 'Cross-cultural communication'] }
        ],
        'C2': [
          { module: 'Từ vựng bậc thầy', lessons: ['Specialized vocabulary', 'Nuanced expressions', 'Literary language', 'Regional variations'] },
          { module: 'Perfection level', lessons: ['Native-like fluency', 'Advanced rhetoric', 'Professional mastery', 'Cultural insights'] }
        ]
      },
      grammar: {
        'A1': [
          { module: 'Ngữ pháp cơ bản', lessons: ['Thì hiện tại đơn', 'Thì hiện tại tiếp diễn', 'Động từ "to be"', 'Câu hỏi với "Wh-"'] },
          { module: 'Cấu trúc câu', lessons: ['Câu khẳng định', 'Câu phủ định', 'Câu nghi vấn', 'Giới từ cơ bản'] }
        ],
        'A2': [
          { module: 'Thì động từ', lessons: ['Quá khứ đơn', 'Tương lai đơn', 'Thì hiện tại hoàn thành', 'So sánh hơn và nhất'] },
          { module: 'Modal verbs', lessons: ['Can và could', 'Must và have to', 'Should và ought to', 'May và might'] }
        ],
        'B1': [
          { module: 'Ngữ pháp trung cấp', lessons: ['Passive voice', 'Reported speech', 'Conditional type 1', 'Relative clauses'] },
          { module: 'Cấu trúc nâng cao', lessons: ['Gerunds và infinitives', 'Phrasal verbs', 'Linking words', 'Tenses review'] }
        ],
        'B2': [
          { module: 'Ngữ pháp cao cấp', lessons: ['Conditional type 2&3', 'Mixed conditionals', 'Advanced passive', 'Subjunctive mood'] },
          { module: 'Cấu trúc phức tạp', lessons: ['Inversion', 'Cleft sentences', 'Participle clauses', 'Advanced linking'] }
        ],
        'C1': [
          { module: 'Ngữ pháp chuyên sâu', lessons: ['Advanced tenses', 'Complex conditionals', 'Emphasis structures', 'Academic grammar'] },
          { module: 'Văn phong cao cấp', lessons: ['Formal structures', 'Register variation', 'Discourse markers', 'Stylistic devices'] }
        ],
        'C2': [
          { module: 'Ngữ pháp bậc thầy', lessons: ['Sophisticated structures', 'Nuanced grammar', 'Literary devices', 'Native-like usage'] },
          { module: 'Hoàn thiện kỹ năng', lessons: ['Error analysis', 'Style adaptation', 'Advanced rhetoric', 'Professional mastery'] }
        ]
      }
    };

    return curriculumTemplates[type as keyof typeof curriculumTemplates]?.[level as keyof typeof curriculumTemplates.vocabulary] || [
      { module: 'Module 1', lessons: ['Lesson 1', 'Lesson 2', 'Lesson 3'] },
      { module: 'Module 2', lessons: ['Lesson 4', 'Lesson 5', 'Lesson 6'] }
    ];
  };

  const generateRequirements = (level: string): string[] => {
    const requirementsByLevel = {
      'A1': [
        'Không cần kiến thức tiếng Anh trước đó',
        'Máy tính hoặc điện thoại có kết nối internet',
        'Động lực học tập và luyện tập thường xuyên',
        'Dành ít nhất 30 phút/ngày để học'
      ],
      'A2': [
        'Có kiến thức tiếng Anh cơ bản (A1)',
        'Hiểu được các câu đơn giản',
        'Máy tính hoặc điện thoại có kết nối internet',
        'Dành 45 phút/ngày để học và luyện tập'
      ],
      'B1': [
        'Đã hoàn thành trình độ A2 hoặc tương đương',
        'Có thể giao tiếp cơ bản bằng tiếng Anh',
        'Máy tính với trình duyệt web hiện đại',
        'Dành 1 giờ/ngày để học và thực hành'
      ],
      'B2': [
        'Trình độ B1 hoặc tương đương',
        'Có thể hiểu văn bản tiếng Anh trung bình',
        'Máy tính/laptop để làm bài tập',
        'Cam kết học ít nhất 1.5 giờ/ngày'
      ],
      'C1': [
        'Đã đạt trình độ B2 tiếng Anh',
        'Có thể giao tiếp thành thạo trong hầu hết tình huống',
        'Máy tính với các phần mềm hỗ trợ học tập',
        'Dành 2 giờ/ngày cho việc học và nghiên cứu'
      ],
      'C2': [
        'Trình độ C1 hoặc gần đạt trình độ thành thạo',
        'Có thể hiểu hầu hết văn bản phức tạp',
        'Máy tính với internet tốc độ cao',
        'Cam kết học tập nghiêm túc ít nhất 2-3 giờ/ngày'
      ]
    };

    return requirementsByLevel[level as keyof typeof requirementsByLevel] || [
      'Có động lực học tập',
      'Máy tính có kết nối internet',
      'Thời gian học tập thường xuyên'
    ];
  };

  // Convert API Course to CourseDetail DetailCourse format
  const convertToDetailCourse = (apiCourse: Course): DetailCourse => {
    return {
      id: apiCourse._id!,
      title: apiCourse.title,
      level: apiCourse.level,
      price: apiCourse.price,
      originalPrice: apiCourse.originalPrice,
      duration: apiCourse.duration,
      lessonsCount: apiCourse.lessonsCount,
      studentsCount: apiCourse.studentsCount,
      rating: 4.8, // Default rating since not in API
      description: apiCourse.description,
      features: apiCourse.benefits || [],
      curriculum: generateCurriculum(apiCourse.level, apiCourse.type),
      instructor: {
        name: apiCourse.instructor,
        title: 'Giáo viên chuyên ngành',
        experience: '5+ năm kinh nghiệm',
        avatar: '/instructor-avatar.jpg'
      },
      whatYouLearn: generateWhatYouLearn(apiCourse.level, apiCourse.type),
      requirements: generateRequirements(apiCourse.level),
      isPopular: false,
      vocabulary: apiCourse.vocabulary || [],
      grammar: apiCourse.grammar || []
    };
  };

  // Main courses page
  if (currentView === 'main') {
    return (
      <CoursesPage 
        onCourseTypeSelect={handleCourseTypeSelect}
        onBack={handleBack}
      />
    );
  }

  // Course list by type
  if (currentView === 'vocabulary' || currentView === 'grammar') {
    return (
      <CoursesPage 
        selectedType={currentView}
        onCourseTypeSelect={handleCourseTypeSelect}
        onCourseSelect={handleCourseSelect}
        onBack={handleBack}
      />
    );
  }

  // Course detail page
  if (currentView === 'detail' && selectedCourse) {
    return (
      <CourseDetail 
        course={convertToDetailCourse(selectedCourse)}
        onBack={handleBack}
        onEnroll={handleEnroll}
        isPurchased={purchasedCourses.has(selectedCourse._id || '')}
      />
    );
  }

  return null;
};

export default CourseApp;
