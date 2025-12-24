import type { Course } from '../hooks/useCourses';

// Mock data - trong thực tế sẽ fetch từ API
export const vocabularyCourses: Course[] = [
  {
    id: 'vocab-a1',
    title: 'Từ vựng cơ bản hàng ngày',
    level: 'A1',
    type: 'vocabulary',
    price: 299000,
    originalPrice: 399000,
    duration: '4 tuần',
    lessonsCount: 20,
    studentsCount: 1250,
    rating: 4.8,
    description: 'Học 500+ từ vựng thiết yếu cho cuộc sống hàng ngày với phương pháp ghi nhớ thông minh',
    features: ['Học từ theo chủ đề', 'Flashcard thông minh', 'Game ôn tập', 'Phát âm chuẩn'],
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Nắm vững 500+ từ vựng cơ bản hàng ngày',
      'Sử dụng từ vựng trong các tình huống thực tế',
      'Phát âm chuẩn các từ vựng quan trọng',
      'Kỹ thuật ghi nhớ từ vựng hiệu quả',
      'Xây dựng nền tảng vững chắc cho việc học tiếng Anh',
      'Tự tin giao tiếp trong các tình huống cơ bản'
    ],
    requirements: [
      'Không cần kiến thức tiếng Anh trước đó',
      'Có thiết bị kết nối internet',
      'Dành 30 phút mỗi ngày để học',
      'Sẵn sàng thực hành và làm bài tập'
    ],
    curriculum: [
      {
        module: 'Giới thiệu và định hướng học tập',
        lessons: [
          'Chào mừng đến với khóa học',
          'Cách sử dụng hiệu quả khóa học',
          'Đánh giá trình độ ban đầu',
          'Lập kế hoạch học tập cá nhân'
        ]
      },
      {
        module: 'Từ vựng gia đình và bạn bè',
        lessons: [
          'Các thành viên trong gia đình',
          'Mô tả ngoại hình và tính cách',
          'Hoạt động gia đình hàng ngày',
          'Giới thiệu bạn bè và người quen'
        ]
      },
      {
        module: 'Từ vựng về nhà ở và đồ dùng',
        lessons: [
          'Các phòng trong nhà',
          'Đồ nội thất và trang thiết bị',
          'Mô tả ngôi nhà của bạn',
          'Hoạt động trong nhà'
        ]
      },
      {
        module: 'Từ vựng về thức ăn và đồ uống',
        lessons: [
          'Các loại thực phẩm cơ bản',
          'Đồ uống phổ biến',
          'Đặt món ăn tại nhà hàng',
          'Nói về sở thích ăn uống'
        ]
      },
      {
        module: 'Từ vựng về thời gian và hoạt động',
        lessons: [
          'Giờ, ngày, tháng, năm',
          'Hoạt động hàng ngày',
          'Sở thích và giải trí',
          'Lên kế hoạch cho hoạt động'
        ]
      }
    ],
    instructor: {
      name: 'Cô Minh Anh',
      title: 'Chuyên gia giảng dạy từ vựng',
      experience: '8 năm kinh nghiệm giảng dạy, Thạc sĩ Ngôn ngữ Anh',
      avatar: '/api/placeholder/64/64'
    }
  },
  {
    id: 'vocab-a2',
    title: 'Từ vựng giao tiếp cơ bản',
    level: 'A2',
    type: 'vocabulary',
    price: 399000,
    originalPrice: 499000,
    duration: '6 tuần',
    lessonsCount: 30,
    studentsCount: 980,
    rating: 4.7,
    description: 'Mở rộng vốn từ vựng với 800+ từ mới cho giao tiếp và công việc cơ bản',
    features: ['Từ vựng theo tình huống', 'Thực hành hội thoại', 'Quiz tương tác', 'Theo dõi tiến độ'],
    isPopular: true,
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Mở rộng vốn từ với 800+ từ vựng mới',
      'Giao tiếp tự tin trong các tình huống thông dụng',
      'Sử dụng từ vựng chuyên nghiệp cơ bản',
      'Hiểu và sử dụng các cụm từ phổ biến',
      'Kỹ năng nghe hiểu trong giao tiếp hàng ngày',
      'Xây dựng câu phức tạp hơn với từ vựng đa dạng'
    ],
    requirements: [
      'Đã hoàn thành khóa A1 hoặc có kiến thức tương đương',
      'Có thể đọc và viết tiếng Anh cơ bản',
      'Muốn cải thiện kỹ năng giao tiếp',
      'Dành 45 phút mỗi ngày để học và thực hành'
    ],
    curriculum: [
      {
        module: 'Ôn tập và nâng cao A1',
        lessons: [
          'Kiểm tra kiến thức A1',
          'Bổ sung từ vựng cần thiết',
          'Kỹ thuật ghi nhớ nâng cao',
          'Chuẩn bị cho trình độ A2'
        ]
      },
      {
        module: 'Từ vựng công việc và học tập',
        lessons: [
          'Các nghề nghiệp phổ biến',
          'Môi trường làm việc',
          'Kỹ năng và năng lực',
          'Học tập và giáo dục'
        ]
      },
      {
        module: 'Từ vựng du lịch và giao thông',
        lessons: [
          'Phương tiện giao thông',
          'Đặt phòng khách sạn',
          'Hỏi đường và chỉ đường',
          'Hoạt động du lịch'
        ]
      },
      {
        module: 'Từ vựng mua sắm và dịch vụ',
        lessons: [
          'Mua sắm quần áo',
          'Siêu thị và cửa hàng',
          'Dịch vụ ngân hàng',
          'Các dịch vụ công cộng'
        ]
      }
    ],
    instructor: {
      name: 'Thầy Đức Minh',
      title: 'Giảng viên tiếng Anh giao tiếp',
      experience: '10 năm kinh nghiệm, Chứng chỉ TESOL',
      avatar: '/api/placeholder/64/64'
    }
  },
  // Add more vocabulary courses B1-C2
  {
    id: 'vocab-b1',
    title: 'Từ vựng trung cấp',
    level: 'B1',
    type: 'vocabulary',
    price: 599000,
    originalPrice: 799000,
    duration: '8 tuần',
    lessonsCount: 40,
    studentsCount: 756,
    rating: 4.9,
    description: 'Nâng cao vốn từ với 1200+ từ vựng chuyên sâu cho công việc và học tập',
    features: ['Từ vựng chuyên ngành', 'Collocations', 'Idioms phổ biến', 'Writing exercises'],
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Nắm vững 1200+ từ vựng trung cấp',
      'Sử dụng collocations và idioms tự nhiên',
      'Viết email và báo cáo công việc',
      'Hiểu được các bài báo tin tức',
      'Giao tiếp tự tin trong môi trường làm việc',
      'Chuẩn bị tốt cho kỳ thi IELTS/TOEIC'
    ],
    requirements: [
      'Đã hoàn thành trình độ A2',
      'Có vốn từ vựng khoảng 1000-1500 từ',
      'Muốn nâng cao kỹ năng chuyên nghiệp',
      'Dành 1 tiếng mỗi ngày để học'
    ],
    curriculum: [
      {
        module: 'Từ vựng công việc văn phòng',
        lessons: [
          'Môi trường làm việc hiện đại',
          'Meetings và presentations',
          'Email và correspondence',
          'Project management terms'
        ]
      },
      {
        module: 'Từ vựng kinh doanh cơ bản',
        lessons: [
          'Marketing và advertising',
          'Finance và accounting',
          'Sales và customer service',
          'Human resources'
        ]
      }
    ],
    instructor: {
      name: 'Thầy Quang Minh',
      title: 'Chuyên gia từ vựng Business English',
      experience: '15 năm kinh nghiệm, MBA từ Úc',
      avatar: '/api/placeholder/64/64'
    }
  },
  {
    id: 'vocab-b2',
    title: 'Từ vựng nâng cao',
    level: 'B2',
    type: 'vocabulary',
    price: 799000,
    originalPrice: 999000,
    duration: '10 tuần',
    lessonsCount: 50,
    studentsCount: 523,
    rating: 4.8,
    description: 'Làm chủ 1500+ từ vựng phức tạp cho IELTS, công việc và học thuật',
    features: ['Academic vocabulary', 'Business English', 'Advanced collocations', 'Critical thinking'],
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Thành thạo 1500+ từ vựng nâng cao',
      'Sử dụng ngôn ngữ học thuật chính xác',
      'Viết essay và report chuyên nghiệp',
      'Hiểu được literature và academic texts',
      'Thuyết trình và tranh luận hiệu quả',
      'Đạt điểm cao trong IELTS/TOEFL'
    ],
    requirements: [
      'Trình độ B1 hoặc tương đương',
      'Có vốn từ vựng khoảng 2000-3000 từ',
      'Cần cải thiện academic English',
      'Chuẩn bị cho higher education'
    ],
    curriculum: [
      {
        module: 'Advanced Academic Vocabulary',
        lessons: [
          'Research methodology terms',
          'Statistical và data analysis',
          'Literature review vocabulary',
          'Thesis và dissertation terms'
        ]
      },
      {
        module: 'Business và Professional English',
        lessons: [
          'Leadership và management',
          'Strategic planning',
          'International business',
          'Innovation và technology'
        ]
      }
    ],
    instructor: {
      name: 'Cô Sarah Johnson',
      title: 'Giảng viên IELTS và Academic English',
      experience: '12 năm kinh nghiệm, PhD Linguistics',
      avatar: '/api/placeholder/64/64'
    }
  },
  {
    id: 'vocab-c1',
    title: 'Từ vựng chuyên gia',
    level: 'C1',
    type: 'vocabulary',
    price: 999000,
    originalPrice: 1299000,
    duration: '12 tuần',
    lessonsCount: 60,
    studentsCount: 342,
    rating: 4.9,
    description: 'Thành thạo 2000+ từ vựng chuyên nghiệp và học thuật cao cấp',
    features: ['Research vocabulary', 'Professional terms', 'Nuanced expressions', 'Advanced writing'],
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Làm chủ 2000+ từ vựng chuyên sâu',
      'Sử dụng register phù hợp từng ngữ cảnh',
      'Viết research papers chuyên nghiệp',
      'Hiểu subtle meanings và nuances',
      'Giao tiếp như native speakers',
      'Chuẩn bị cho C2 level'
    ],
    requirements: [
      'Trình độ B2 vững chắc',
      'Có kinh nghiệm academic/professional',
      'Muốn đạt trình độ gần native',
      'Cam kết học nghiêm túc'
    ],
    curriculum: [
      {
        module: 'Specialized Academic Fields',
        lessons: [
          'Scientific research terminology',
          'Social sciences vocabulary',
          'Economics và finance advanced',
          'Legal và political terms'
        ]
      }
    ],
    instructor: {
      name: 'Prof. Michael Chen',
      title: 'Professor of Applied Linguistics',
      experience: '20 năm kinh nghiệm, Cambridge examiner',
      avatar: '/api/placeholder/64/64'
    }
  },
  {
    id: 'vocab-c2',
    title: 'Từ vựng bậc thầy',
    level: 'C2',
    type: 'vocabulary',
    price: 1299000,
    originalPrice: 1599000,
    duration: '16 tuần',
    lessonsCount: 80,
    studentsCount: 189,
    rating: 5.0,
    description: 'Đạt trình độ native với 3000+ từ vựng tinh tế và sophisticated expressions',
    features: ['Literary vocabulary', 'Sophisticated expressions', 'Cultural nuances', 'Masterclass content'],
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Thành thạo 3000+ từ vựng sophisticated',
      'Hiểu cultural references và allusions',
      'Sử dụng literary devices và rhetoric',
      'Viết với style và elegance',
      'Thưởng thức literature ở mức cao',
      'Đạt trình độ native speaker'
    ],
    requirements: [
      'Trình độ C1 xuất sắc',
      'Passion for language learning',
      'Advanced academic background',
      'Commitment to excellence'
    ],
    curriculum: [
      {
        module: 'Literary và Cultural Vocabulary',
        lessons: [
          'Classical literature terms',
          'Modern literary criticism',
          'Cultural references',
          'Historical allusions'
        ]
      }
    ],
    instructor: {
      name: 'Dr. Elizabeth Taylor',
      title: 'Literary Scholar và Language Expert',
      experience: 'Oxford PhD, 25 years experience',
      avatar: '/api/placeholder/64/64'
    }
  },
  // Idioms course - Special vocabulary course
  {
    id: 'vocab-idioms',
    title: 'Thành ngữ tiếng Anh thông dụng',
    level: 'B1',
    type: 'vocabulary',
    price: 449000,
    originalPrice: 599000,
    duration: '6 tuần',
    lessonsCount: 36,
    studentsCount: 834,
    rating: 4.9,
    description: 'Học 300+ thành ngữ tiếng Anh phổ biến với ý nghĩa, cách dùng và ví dụ thực tế',
    features: ['300+ idioms phổ biến', 'Ví dụ trong ngữ cảnh', 'Audio pronunciation', 'Practice exercises'],
    isPopular: true,
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Nắm vững 300+ thành ngữ tiếng Anh thông dụng nhất',
      'Hiểu ý nghĩa và nguồn gốc của các idioms',
      'Sử dụng thành ngữ phù hợp trong giao tiếp',
      'Phân biệt formal và informal idioms',
      'Nghe hiểu native speakers khi dùng idioms',
      'Tăng tính tự nhiên trong giao tiếp tiếng Anh'
    ],
    requirements: [
      'Trình độ B1 hoặc tương đương',
      'Có nền tảng từ vựng cơ bản vững chắc',
      'Muốn giao tiếp tự nhiên như native speakers',
      'Quan tâm đến văn hóa và ngôn ngữ Anh-Mỹ'
    ],
    curriculum: [
      {
        module: 'Idioms về cảm xúc và tính cách',
        lessons: [
          'Happy và sad idioms (over the moon, down in the dumps)',
          'Angry và calm idioms (blow your top, keep your cool)',
          'Scared và brave idioms (chicken out, bite the bullet)',
          'Smart và stupid idioms (sharp as a tack, not the brightest bulb)',
          'Lazy và hardworking idioms (couch potato, burn the midnight oil)',
          'Practice: Describing people with idioms'
        ]
      },
      {
        module: 'Idioms về thời gian và tiền bạc',
        lessons: [
          'Time idioms (time flies, in the nick of time)',
          'Money idioms (break the bank, worth a fortune)',
          'Success và failure (hit the jackpot, go bankrupt)',
          'Saving và spending (penny pincher, money burns a hole)',
          'Work và business idioms (climb the corporate ladder)',
          'Practice: Business conversations with idioms'
        ]
      },
      {
        module: 'Idioms về thực phẩm và động vật',
        lessons: [
          'Food idioms (piece of cake, spill the beans)',
          'Animal idioms (let the cat out of the bag, hold your horses)',
          'Body parts idioms (give someone a hand, break a leg)',
          'Weather idioms (under the weather, storm in a teacup)',
          'Colors idioms (green with envy, see red)',
          'Practice: Daily conversation with idioms'
        ]
      },
      {
        module: 'Idioms trong các tình huống cụ thể',
        lessons: [
          'Travel và vacation idioms (hit the road, off the beaten track)',
          'Sports và competition idioms (ball is in your court, level playing field)',
          'Relationship idioms (tie the knot, on the rocks)',
          'Learning và education idioms (hit the books, learn the ropes)',
          'Health idioms (fit as a fiddle, under the weather)',
          'Practice: Role-play với idioms'
        ]
      },
      {
        module: 'Advanced idioms và cultural context',
        lessons: [
          'British vs American idioms',
          'Formal vs informal idioms usage',
          'Idioms in movies và TV shows',
          'Historical background của common idioms',
          'Regional variations và slang',
          'Final assessment và certificate'
        ]
      },
      {
        module: 'Practical application và review',
        lessons: [
          'Idioms in job interviews',
          'Idioms in presentations',
          'Idioms in social media',
          'Common mistakes với idioms',
          'Creating your own idiom dictionary',
          'Graduation ceremony và next steps'
        ]
      }
    ],
    instructor: {
      name: 'Cô Emma Williams',
      title: 'Native Speaker và Idioms Specialist',
      experience: '18 năm giảng dạy, Chuyên gia văn hóa Anh-Mỹ',
      avatar: '/api/placeholder/64/64'
    }
  }
];

export const grammarCourses: Course[] = [
  {
    id: 'grammar-a1',
    title: 'Ngữ pháp cơ bản',
    level: 'A1',
    type: 'grammar',
    price: 249000,
    originalPrice: 349000,
    duration: '3 tuần',
    lessonsCount: 15,
    studentsCount: 1543,
    rating: 4.7,
    description: 'Nắm vững các cấu trúc ngữ pháp cơ bản nhất với bài tập tương tác',
    features: ['Present tenses', 'Basic sentence structure', 'Interactive exercises', 'Instant feedback'],
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Hiểu và sử dụng thì hiện tại đơn và hiện tại tiếp diễn',
      'Xây dựng câu cơ bản đúng ngữ pháp',
      'Sử dụng to be, have/has một cách chính xác',
      'Tạo câu hỏi và câu phủ định',
      'Sử dụng các giới từ cơ bản',
      'Nắm vững quy tắc số ít, số nhiều'
    ],
    requirements: [
      'Không cần kiến thức ngữ pháp trước đó',
      'Biết đọc và viết chữ cái tiếng Anh',
      'Có một số từ vựng cơ bản',
      'Sẵn sàng làm bài tập thực hành'
    ],
    curriculum: [
      {
        module: 'Giới thiệu ngữ pháp tiếng Anh',
        lessons: [
          'Cấu trúc câu cơ bản',
          'Các loại từ trong tiếng Anh',
          'Tầm quan trọng của ngữ pháp',
          'Cách học ngữ pháp hiệu quả'
        ]
      },
      {
        module: 'Động từ to be và have/has',
        lessons: [
          'Cách sử dụng to be',
          'Câu khẳng định với to be',
          'Câu hỏi và phủ định với to be',
          'Động từ have/has'
        ]
      },
      {
        module: 'Thì hiện tại đơn',
        lessons: [
          'Cấu trúc thì hiện tại đơn',
          'Cách chia động từ',
          'Câu hỏi với do/does',
          'Thực hành với các động từ thường'
        ]
      }
    ],
    instructor: {
      name: 'Cô Thu Hà',
      title: 'Chuyên gia ngữ pháp tiếng Anh',
      experience: '7 năm kinh nghiệm, Thạc sĩ Ngôn ngữ học',
      avatar: '/api/placeholder/64/64'
    }
  },
  {
    id: 'grammar-a2',
    title: 'Ngữ pháp thiết yếu',
    level: 'A2',
    type: 'grammar',
    price: 349000,
    originalPrice: 449000,
    duration: '5 tuần',
    lessonsCount: 25,
    studentsCount: 1234,
    rating: 4.8,
    description: 'Mở rộng kiến thức ngữ pháp với các thì và cấu trúc phức tạp hơn',
    features: ['Past & Future tenses', 'Conditional sentences', 'Modal verbs', 'Error correction'],
    isPopular: true,
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Thành thạo các thì quá khứ và tương lai',
      'Sử dụng modal verbs (can, could, should, must)',
      'Xây dựng câu điều kiện cơ bản',
      'So sánh hơn và so sánh nhất',
      'Câu bị động cơ bản',
      'Sửa lỗi ngữ pháp thường gặp'
    ],
    requirements: [
      'Đã hoàn thành ngữ pháp A1',
      'Hiểu cấu trúc câu cơ bản',
      'Có vốn từ vựng khoảng 500-800 từ',
      'Muốn nâng cao kỹ năng viết và nói'
    ],
    curriculum: [
      {
        module: 'Ôn tập ngữ pháp A1',
        lessons: [
          'Kiểm tra kiến thức cơ bản',
          'Bài tập củng cố',
          'Các lỗi thường gặp',
          'Chuẩn bị cho A2'
        ]
      },
      {
        module: 'Thì quá khứ',
        lessons: [
          'Past simple tense',
          'Past continuous tense',
          'So sánh past simple và past continuous',
          'Câu chuyện trong quá khứ'
        ]
      },
      {
        module: 'Thì tương lai',
        lessons: [
          'Will và be going to',
          'Present continuous for future',
          'Future time expressions',
          'Dự đoán và kế hoạch'
        ]
      }
    ],
    instructor: {
      name: 'Thầy Hoàng Nam',
      title: 'Giảng viên ngữ pháp cao cấp',
      experience: '12 năm kinh nghiệm, Chứng chỉ CELTA',
      avatar: '/api/placeholder/64/64'
    }
  },
  // Add more grammar courses B1-C2
  {
    id: 'grammar-b1',
    title: 'Ngữ pháp trung cấp',
    level: 'B1',
    type: 'grammar',
    price: 549000,
    originalPrice: 699000,
    duration: '7 tuần',
    lessonsCount: 35,
    studentsCount: 892,
    rating: 4.9,
    description: 'Thành thạo các cấu trúc ngữ pháp phức tạp cho giao tiếp và viết',
    features: ['Complex sentences', 'Passive voice', 'Reported speech', 'Advanced conditionals'],
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Xây dựng câu phức tạp với nhiều mệnh đề',
      'Sử dụng thành thạo câu bị động',
      'Chuyển đổi lời nói trực tiếp và gián tiếp',
      'Câu điều kiện loại 1, 2, 3',
      'Perfect tenses trong mọi ngữ cảnh',
      'Viết đoạn văn mạch lạc và logic'
    ],
    requirements: [
      'Hoàn thành ngữ pháp A2',
      'Hiểu các thì cơ bản',
      'Muốn cải thiện writing skills',
      'Chuẩn bị cho IELTS/TOEIC'
    ],
    curriculum: [
      {
        module: 'Perfect Tenses Advanced',
        lessons: [
          'Present perfect vs Past simple',
          'Past perfect và time sequence',
          'Future perfect usage',
          'Perfect continuous forms'
        ]
      },
      {
        module: 'Passive Voice Mastery',
        lessons: [
          'Passive in all tenses',
          'Passive with modals',
          'Passive infinitives',
          'Get passive structures'
        ]
      }
    ],
    instructor: {
      name: 'Cô Lan Phương',
      title: 'Chuyên gia ngữ pháp IELTS',
      experience: '14 năm kinh nghiệm, IELTS 8.5',
      avatar: '/api/placeholder/64/64'
    }
  },
  {
    id: 'grammar-b2',
    title: 'Ngữ pháp nâng cao',
    level: 'B2',
    type: 'grammar',
    price: 749000,
    originalPrice: 949000,
    duration: '9 tuần',
    lessonsCount: 45,
    studentsCount: 567,
    rating: 4.8,
    description: 'Hoàn thiện ngữ pháp với các cấu trúc sophisticated cho IELTS và công việc',
    features: ['Subjunctive mood', 'Complex conditionals', 'Advanced linking', 'Style variation'],
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Sử dụng subjunctive mood chính xác',
      'Mixed conditionals và advanced forms',
      'Linking devices for coherence',
      'Inversion và emphasis structures',
      'Academic writing conventions',
      'Formal vs informal registers'
    ],
    requirements: [
      'Trình độ B1 vững chắc',
      'Cần academic writing skills',
      'Chuẩn bị cho IELTS 7.0+',
      'Muốn viết professionally'
    ],
    curriculum: [
      {
        module: 'Advanced Conditional Structures',
        lessons: [
          'Mixed conditionals',
          'Conditional variations',
          'Wish và if only',
          'Should have, could have'
        ]
      },
      {
        module: 'Academic Writing Grammar',
        lessons: [
          'Nominalization techniques',
          'Complex noun phrases',
          'Academic linking devices',
          'Formal sentence structures'
        ]
      }
    ],
    instructor: {
      name: 'Dr. James Wilson',
      title: 'Academic Writing Specialist',
      experience: '16 năm kinh nghiệm, Cambridge trainer',
      avatar: '/api/placeholder/64/64'
    }
  },
  {
    id: 'grammar-c1',
    title: 'Ngữ pháp chuyên gia',
    level: 'C1',
    type: 'grammar',
    price: 949000,
    originalPrice: 1199000,
    duration: '11 tuần',
    lessonsCount: 55,
    studentsCount: 298,
    rating: 4.9,
    description: 'Làm chủ hoàn toàn ngữ pháp tiếng Anh ở trình độ chuyên nghiệp',
    features: ['Formal register', 'Academic writing', 'Stylistic devices', 'Error analysis'],
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Thành thạo formal và academic register',
      'Sử dụng stylistic devices hiệu quả',
      'Phân tích và sửa lỗi ngữ pháp',
      'Advanced discourse markers',
      'Sophisticated sentence structures',
      'Professional communication grammar'
    ],
    requirements: [
      'Trình độ B2 xuất sắc',
      'Có kinh nghiệm academic writing',
      'Muốn đạt C1/C2 level',
      'Serious commitment required'
    ],
    curriculum: [
      {
        module: 'Discourse và Cohesion',
        lessons: [
          'Advanced cohesive devices',
          'Discourse markers mastery',
          'Text organization strategies',
          'Register appropriateness'
        ]
      }
    ],
    instructor: {
      name: 'Prof. Catherine Brown',
      title: 'Applied Linguistics Professor',
      experience: '22 năm kinh nghiệm, PhD Cambridge',
      avatar: '/api/placeholder/64/64'
    }
  },
  {
    id: 'grammar-c2',
    title: 'Ngữ pháp bậc thầy',
    level: 'C2',
    type: 'grammar',
    price: 1199000,
    originalPrice: 1499000,
    duration: '15 tuần',
    lessonsCount: 75,
    studentsCount: 156,
    rating: 5.0,
    description: 'Đạt trình độ native với các cấu trúc ngữ pháp tinh tế nhất',
    features: ['Nuanced structures', 'Literary devices', 'Regional variations', 'Expert analysis'],
    thumbnail: '/api/placeholder/300/200',
    whatYouLearn: [
      'Thành thạo nuanced grammatical structures',
      'Hiểu regional variations',
      'Sử dụng literary devices',
      'Expert-level error recognition',
      'Native-like intuition',
      'Teaching grammar effectively'
    ],
    requirements: [
      'C1 level excellence',
      'Advanced language background',
      'Professional/academic needs',
      'Dedication to perfection'
    ],
    curriculum: [
      {
        module: 'Subtle Grammar Distinctions',
        lessons: [
          'Fine nuances in usage',
          'Regional grammar variations',
          'Historical development',
          'Expert error analysis'
        ]
      }
    ],
    instructor: {
      name: 'Prof. David Crystal',
      title: 'World-renowned Linguist',
      experience: '40+ years, Author of 100+ books',
      avatar: '/api/placeholder/64/64'
    }
  }
];
