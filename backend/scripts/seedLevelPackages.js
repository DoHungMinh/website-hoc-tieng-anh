/**
 * Seed Level Packages (A1-C2)
 * Chạy script này để tạo 6 level packages trong database
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/english-learning');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Level Package data
const levelPackagesData = [
  {
    level: 'A1',
    name: 'Level A1 - Beginner English',
    description: 'Bắt đầu hành trình học tiếng Anh với Level A1. Học từ vựng cơ bản, ngữ pháp nền tảng và giao tiếp đơn giản trong cuộc sống hàng ngày.',
    price: 10000,
    originalPrice: 299000,
    thumbnail: '/images/levels/a1.jpg',
    features: [
      '30+ khóa học từ vựng và ngữ pháp',
      '300+ từ vựng thông dụng với phát âm chuẩn',
      '20+ quy tắc ngữ pháp cơ bản',
      'Luyện nghe, nói, đọc, viết toàn diện',
      'Bài tập thực hành phong phú',
      'Học mọi lúc mọi nơi'
    ],
    benefits: [
      'Hiểu và sử dụng các cụm từ quen thuộc hàng ngày',
      'Giới thiệu bản thân và người khác',
      'Hỏi và trả lời về thông tin cá nhân',
      'Giao tiếp đơn giản trong các tình huống cơ bản'
    ],
    duration: '3-4 tháng',
    status: 'active'
  },
  {
    level: 'A2',
    name: 'Level A2 - Elementary English',
    description: 'Nâng cao kiến thức tiếng Anh cơ bản với Level A2. Mở rộng vốn từ vựng, nắm vững ngữ pháp và tự tin giao tiếp trong nhiều tình huống.',
    price: 10000,
    originalPrice: 399000,
    thumbnail: '/images/levels/a2.jpg',
    features: [
      '35+ khóa học đa dạng chủ đề',
      '400+ từ vựng nâng cao',
      '25+ cấu trúc ngữ pháp quan trọng',
      'Luyện phát âm và nghe hiểu',
      'Bài học tương tác sinh động',
      'Cộng đồng học tập hỗ trợ'
    ],
    benefits: [
      'Hiểu câu và cụm từ thông dụng trong cuộc sống',
      'Giao tiếp trong các tình huống quen thuộc',
      'Mô tả bản thân, môi trường xung quanh',
      'Đáp ứng nhu cầu giao tiếp đơn giản'
    ],
    duration: '3-5 tháng',
    status: 'active'
  },
  {
    level: 'B1',
    name: 'Level B1 - Intermediate English',
    description: 'Đạt trình độ trung cấp với Level B1. Tự tin giao tiếp trong công việc, du lịch và các tình huống phức tạp hơn.',
    price: 10000,
    originalPrice: 499000,
    thumbnail: '/images/levels/b1.jpg',
    features: [
      '40+ khóa học chuyên sâu',
      '500+ từ vựng đa dạng lĩnh vực',
      '30+ cấu trúc ngữ pháp nâng cao',
      'Luyện speaking với AI',
      'Reading comprehension training',
      'Writing skills development'
    ],
    benefits: [
      'Hiểu nội dung chính của văn bản tiêu chuẩn',
      'Giao tiếp trong các tình huống du lịch',
      'Viết văn bản đơn giản về chủ đề quen thuộc',
      'Mô tả kinh nghiệm, sự kiện, ước mơ'
    ],
    duration: '4-6 tháng',
    status: 'active'
  },
  {
    level: 'B2',
    name: 'Level B2 - Upper-Intermediate English',
    description: 'Thành thạo tiếng Anh với Level B2. Giao tiếp tự nhiên, hiểu các văn bản phức tạp và sẵn sàng cho môi trường làm việc quốc tế.',
    price: 10000,
    originalPrice: 599000,
    thumbnail: '/images/levels/b2.jpg',
    features: [
      '45+ khóa học chuyên nghiệp',
      '600+ từ vựng academic và business',
      '35+ cấu trúc ngữ pháp phức tạp',
      'Business English training',
      'IELTS preparation basics',
      'Advanced pronunciation'
    ],
    benefits: [
      'Hiểu ý chính của văn bản phức tạp',
      'Giao tiếp lưu loát với người bản ngữ',
      'Viết văn bản chi tiết về nhiều chủ đề',
      'Giải thích quan điểm về các vấn đề'
    ],
    duration: '5-7 tháng',
    status: 'active'
  },
  {
    level: 'C1',
    name: 'Level C1 - Advanced English',
    description: 'Trình độ cao cấp với Level C1. Sử dụng tiếng Anh linh hoạt trong học thuật, công việc và đời sống xã hội.',
    price: 10000,
    originalPrice: 699000,
    thumbnail: '/images/levels/c1.jpg',
    features: [
      '50+ khóa học nâng cao',
      '700+ từ vựng chuyên ngành',
      '40+ cấu trúc ngữ pháp advanced',
      'Academic English mastery',
      'Professional communication',
      'Critical thinking development'
    ],
    benefits: [
      'Hiểu văn bản dài và phức tạp',
      'Diễn đạt lưu loát, tự nhiên',
      'Sử dụng tiếng Anh hiệu quả trong công việc',
      'Viết văn bản rõ ràng, có cấu trúc tốt'
    ],
    duration: '6-8 tháng',
    status: 'active'
  },
  {
    level: 'C2',
    name: 'Level C2 - Proficiency English',
    description: 'Đỉnh cao thành thạo với Level C2. Sử dụng tiếng Anh như người bản ngữ, hiểu mọi thứ nghe và đọc.',
    price: 10000,
    originalPrice: 799000,
    thumbnail: '/images/levels/c2.jpg',
    features: [
      '55+ khóa học master level',
      '800+ từ vựng chuyên sâu',
      '45+ advanced grammar structures',
      'Native-like fluency training',
      'Complex text analysis',
      'Professional writing mastery'
    ],
    benefits: [
      'Hiểu mọi thứ nghe hoặc đọc một cách dễ dàng',
      'Tóm tắt thông tin từ nhiều nguồn',
      'Diễn đạt tự nhiên, chính xác, tinh tế',
      'Phân biệt các sắc thái ý nghĩa'
    ],
    duration: '6-9 tháng',
    status: 'active'
  }
];

// Seed function
const seedLevelPackages = async () => {
  try {
    await connectDB();

    // Import model
    const LevelPackage = require('../src/models/LevelPackage').default || require('../src/models/LevelPackage');

    // Xóa data cũ (nếu muốn reset)
    // await LevelPackage.deleteMany({});
    // console.log('🗑️  Cleared old level packages');

    // Tạo level packages mới
    for (const data of levelPackagesData) {
      const existing = await LevelPackage.findOne({ level: data.level });
      
      if (existing) {
        console.log(`⏭️  Level ${data.level} đã tồn tại, bỏ qua...`);
        continue;
      }

      const levelPackage = new LevelPackage(data);
      await levelPackage.save();
      console.log(`✅ Đã tạo Level ${data.level} Package`);
    }

    console.log('\n🎉 Seed level packages thành công!');
    console.log('📦 Tổng số levels:', levelPackagesData.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run seed
seedLevelPackages();
