/**
 * Migration Script: Migrate old Course Enrollments to Level Enrollments
 * 
 * Logic:
 * - User đã mua course A1 → Tặng Level A1
 * - User mua nhiều courses cùng level → Chỉ tạo 1 level enrollment
 * - Không xóa enrollment cũ (để tham khảo)
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

const migrateEnrollments = async () => {
  try {
    await connectDB();

    // Import models
    const Enrollment = require('../src/models/Enrollment').default || require('../src/models/Enrollment');
    const Course = require('../src/models/Course').default || require('../src/models/Course');
    const LevelEnrollment = require('../src/models/LevelEnrollment').default || require('../src/models/LevelEnrollment');
    const LevelPackage = require('../src/models/LevelPackage').default || require('../src/models/LevelPackage');

    console.log('🔄 Bắt đầu migration từ Course Enrollments → Level Enrollments\n');

    // Lấy tất cả enrollments cũ
    const oldEnrollments = await Enrollment.find().populate('courseId');
    console.log(`📊 Tìm thấy ${oldEnrollments.length} course enrollments\n`);

    if (oldEnrollments.length === 0) {
      console.log('✅ Không có enrollment nào cần migrate');
      process.exit(0);
    }

    // Group enrollments theo userId và level
    const userLevelMap = new Map(); // Key: "userId-level", Value: { userId, level, enrolledAt }

    for (const enrollment of oldEnrollments) {
      if (!enrollment.courseId) {
        console.log(`⚠️  Enrollment ${enrollment._id} không có courseId, bỏ qua`);
        continue;
      }

      const course = enrollment.courseId;
      const userId = enrollment.userId.toString();
      const level = course.level;
      const key = `${userId}-${level}`;

      // Lưu enrollment cũ nhất (earliest)
      if (!userLevelMap.has(key) || enrollment.enrolledAt < userLevelMap.get(key).enrolledAt) {
        userLevelMap.set(key, {
          userId,
          level,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status === 'completed' ? 'completed' : 'active'
        });
      }
    }

    console.log(`📋 Phát hiện ${userLevelMap.size} level enrollments unique\n`);

    // Tạo level enrollments mới
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const [key, data] of userLevelMap) {
      try {
        // Kiểm tra đã tồn tại chưa
        const existing = await LevelEnrollment.findOne({
          userId: data.userId,
          level: data.level
        });

        if (existing) {
          console.log(`⏭️  [${data.level}] User ${data.userId.substring(0, 8)}... đã có level enrollment`);
          skipCount++;
          continue;
        }

        // Tạo level enrollment mới
        const levelEnrollment = new LevelEnrollment({
          userId: data.userId,
          level: data.level,
          enrolledAt: data.enrolledAt,
          status: data.status,
          lastAccessedAt: new Date(),
          // Không set orderCode, paidAmount (migration miễn phí)
        });

        await levelEnrollment.save();

        // Tăng studentsCount của level package
        await LevelPackage.findOneAndUpdate(
          { level: data.level },
          { $inc: { studentsCount: 1 } }
        );

        console.log(`✅ [${data.level}] Đã tạo level enrollment cho user ${data.userId.substring(0, 8)}...`);
        successCount++;

      } catch (error) {
        console.error(`❌ [${data.level}] Lỗi migrate user ${data.userId.substring(0, 8)}...:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Thành công:    ${successCount} level enrollments`);
    console.log(`⏭️  Đã tồn tại:   ${skipCount} level enrollments`);
    console.log(`❌ Lỗi:          ${errorCount} level enrollments`);
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n🎉 Migration hoàn tất! Users đã được tặng miễn phí level tương ứng.');
      console.log('📝 Lưu ý: Course enrollments cũ vẫn còn trong database để tham khảo.');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

// Run migration
migrateEnrollments();
