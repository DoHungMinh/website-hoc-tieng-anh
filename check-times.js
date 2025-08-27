const mongoose = require('mongoose');

async function checkUserTimes() {
  try {
    await mongoose.connect('mongodb+srv://root:123@cluster0.z6bkumx.mongodb.net/english_learning_web?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const users = await User.find({}, { 
      email: 1, 
      createdAt: 1, 
      lastSeen: 1,
      accountStatus: 1
    }).sort({ createdAt: -1 });
    
    console.log('\n=== USER TIMES COMPARISON ===');
    users.forEach((user, index) => {
      const createdAt = new Date(user.createdAt);
      const lastSeen = user.lastSeen ? new Date(user.lastSeen) : null;
      const timeDiff = lastSeen ? Math.abs(lastSeen.getTime() - createdAt.getTime()) : 0;
      const diffMins = Math.floor(timeDiff / 60000);
      
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   accountStatus: ${user.accountStatus}`);
      console.log(`   createdAt: ${createdAt.toISOString()}`);
      console.log(`   lastSeen: ${lastSeen ? lastSeen.toISOString() : 'null'}`);
      console.log(`   timeDiff: ${diffMins} minutes`);
      console.log(`   shouldShow: ${diffMins < 1 ? 'Chưa đăng nhập' : 'Thời gian thực'}`);
      console.log('');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserTimes();
