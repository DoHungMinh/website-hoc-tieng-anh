const mongoose = require('mongoose');

async function migrateUsers() {
  try {
    await mongoose.connect('mongodb+srv://root:123@cluster0.z6bkumx.mongodb.net/english_learning_web?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Tìm users không có accountStatus hoặc có accountStatus undefined/null
    const usersToUpdate = await User.find({
      $or: [
        { accountStatus: { $exists: false } },
        { accountStatus: null },
        { accountStatus: undefined },
        { accountStatus: 'undefined' }
      ]
    }, { email: 1, accountStatus: 1 });
    
    console.log('\n=== USERS CẦN CẬP NHẬT ===');
    usersToUpdate.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - accountStatus: '${user.accountStatus}'`);
    });
    
    if (usersToUpdate.length > 0) {
      // Cập nhật tất cả users này thành 'active'
      const result = await User.updateMany(
        {
          $or: [
            { accountStatus: { $exists: false } },
            { accountStatus: null },
            { accountStatus: undefined },
            { accountStatus: 'undefined' }
          ]
        },
        { 
          $set: { 
            accountStatus: 'active',
            isOnline: false,
            lastSeen: new Date()
          } 
        }
      );
      
      console.log(`\n✅ Đã cập nhật ${result.modifiedCount} users thành 'active'`);
    } else {
      console.log('\n✅ Tất cả users đã có accountStatus hợp lệ');
    }
    
    // Kiểm tra lại thống kê
    const total = await User.countDocuments();
    const active = await User.countDocuments({ accountStatus: 'active' });
    const disabled = await User.countDocuments({ accountStatus: 'disabled' });
    
    console.log('\n=== THỐNG KÊ SAU KHI CẬP NHẬT ===');
    console.log(`Total users: ${total}`);
    console.log(`Active users: ${active}`);
    console.log(`Disabled users: ${disabled}`);
    
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

migrateUsers();
