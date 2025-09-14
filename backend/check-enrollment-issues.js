const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/website-hoc-tieng-anh');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Define schemas inline
const userSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  role: String,
  accountStatus: String
});

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId },
  enrollmentDate: Date,
  status: String
});

const courseSchema = new mongoose.Schema({
  title: String,
  price: Number
});

const User = mongoose.model('User', userSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
const Course = mongoose.model('Course', courseSchema);

// Check for enrollment issues
const checkEnrollmentIssues = async () => {
  console.log('\n🔍 Kiểm tra các vấn đề về enrollment...\n');

  try {
    // 1. Kiểm tra các enrollment duplicate
    console.log('1. Kiểm tra enrollment duplicate:');
    const duplicateEnrollments = await Enrollment.aggregate([
      {
        $group: {
          _id: { userId: '$userId', courseId: '$courseId' },
          count: { $sum: 1 },
          docs: { $push: '$$ROOT' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicateEnrollments.length > 0) {
      console.log(`❌ Tìm thấy ${duplicateEnrollments.length} enrollment duplicate:`);
      for (const dup of duplicateEnrollments) {
        const user = await User.findById(dup._id.userId);
        const course = await Course.findById(dup._id.courseId);
        console.log(`   - User: ${user?.email || 'Unknown'} | Course: ${course?.title || 'Unknown'} | Số lượng: ${dup.count}`);
        
        // List all duplicate enrollments
        for (const doc of dup.docs) {
          console.log(`     * Enrollment ID: ${doc._id} | Date: ${doc.enrollmentDate} | Status: ${doc.status}`);
        }
      }
    } else {
      console.log('✅ Không tìm thấy enrollment duplicate');
    }

    // 2. Kiểm tra các enrollment với user không tồn tại
    console.log('\n2. Kiểm tra enrollment với user không tồn tại:');
    const enrollments = await Enrollment.find().populate('userId');
    const orphanedEnrollments = enrollments.filter(e => !e.userId);
    
    if (orphanedEnrollments.length > 0) {
      console.log(`❌ Tìm thấy ${orphanedEnrollments.length} enrollment với user không tồn tại:`);
      for (const enrollment of orphanedEnrollments) {
        console.log(`   - Enrollment ID: ${enrollment._id} | Course ID: ${enrollment.courseId}`);
      }
    } else {
      console.log('✅ Tất cả enrollment đều có user hợp lệ');
    }

    // 3. Kiểm tra các enrollment với course không tồn tại
    console.log('\n3. Kiểm tra enrollment với course không tồn tại:');
    const allEnrollments = await Enrollment.find();
    const invalidCourseEnrollments = [];
    
    for (const enrollment of allEnrollments) {
      const course = await Course.findById(enrollment.courseId);
      if (!course) {
        invalidCourseEnrollments.push(enrollment);
      }
    }
    
    if (invalidCourseEnrollments.length > 0) {
      console.log(`❌ Tìm thấy ${invalidCourseEnrollments.length} enrollment với course không tồn tại:`);
      for (const enrollment of invalidCourseEnrollments) {
        const user = await User.findById(enrollment.userId);
        console.log(`   - Enrollment ID: ${enrollment._id} | User: ${user?.email || 'Unknown'} | Course ID: ${enrollment.courseId}`);
      }
    } else {
      console.log('✅ Tất cả enrollment đều có course hợp lệ');
    }

    // 4. Liệt kê tất cả users và enrollments của họ
    console.log('\n4. Tổng quan về users và enrollments:');
    const users = await User.find().sort({ email: 1 });
    
    for (const user of users) {
      const userEnrollments = await Enrollment.find({ userId: user._id }).populate('courseId');
      console.log(`\n👤 User: ${user.email} (${user._id})`);
      console.log(`   - Role: ${user.role} | Status: ${user.accountStatus}`);
      console.log(`   - Enrollments: ${userEnrollments.length}`);
      
      for (const enrollment of userEnrollments) {
        const course = await Course.findById(enrollment.courseId);
        console.log(`     * Course: ${course?.title || 'Unknown'} | Status: ${enrollment.status} | Date: ${enrollment.enrollmentDate}`);
      }
    }

    console.log('\n✅ Hoàn thành kiểm tra enrollment issues');

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra enrollment:', error);
  }
};

// Clean up duplicate enrollments
const cleanupDuplicateEnrollments = async () => {
  console.log('\n🧹 Dọn dẹp enrollment duplicate...\n');

  try {
    const duplicateEnrollments = await Enrollment.aggregate([
      {
        $group: {
          _id: { userId: '$userId', courseId: '$courseId' },
          count: { $sum: 1 },
          docs: { $push: '$$ROOT' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicateEnrollments.length === 0) {
      console.log('✅ Không có enrollment duplicate để dọn dẹp');
      return;
    }

    for (const dup of duplicateEnrollments) {
      console.log(`Dọn dẹp duplicate cho userId: ${dup._id.userId}, courseId: ${dup._id.courseId}`);
      
      // Sort by enrollment date, keep the earliest one
      const sortedDocs = dup.docs.sort((a, b) => new Date(a.enrollmentDate) - new Date(b.enrollmentDate));
      const keepDoc = sortedDocs[0];
      const deleteIds = sortedDocs.slice(1).map(doc => doc._id);
      
      console.log(`   - Giữ lại: ${keepDoc._id} (${keepDoc.enrollmentDate})`);
      console.log(`   - Xóa: ${deleteIds.join(', ')}`);
      
      // Uncomment the line below to actually delete duplicates
      // await Enrollment.deleteMany({ _id: { $in: deleteIds } });
    }

    console.log('\n⚠️  Để thực sự xóa, bỏ comment dòng deleteMany trong code');

  } catch (error) {
    console.error('❌ Lỗi khi dọn dẹp enrollment:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--check')) {
    await checkEnrollmentIssues();
  } else if (args.includes('--cleanup')) {
    await cleanupDuplicateEnrollments();
  } else {
    console.log('Usage:');
    console.log('  node check-enrollment-issues.js --check   # Kiểm tra các vấn đề');
    console.log('  node check-enrollment-issues.js --cleanup # Dọn dẹp duplicate');
  }
  
  mongoose.disconnect();
};

main().catch(console.error);