const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb+srv://root:123@cluster0.z6bkumx.mongodb.net/english_learning_web?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const User = mongoose.model('User', new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  role: String
}, { timestamps: true }));

async function resetPasswords() {
  try {
    console.log('\n🔄 Resetting passwords to "123456"...');
    
    // Get new hash for 123456
    const newPasswordHash = await bcrypt.hash('123456', 10);
    console.log('🆕 New password hash:', newPasswordHash.substring(0, 20) + '...');
    
    // Update all users
    const result = await User.updateMany(
      {}, // all users
      { password: newPasswordHash }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users`);
    
    // Test login again
    const user = await User.findOne({ email: 'admin@test.com' });
    if (user) {
      const isMatch = await bcrypt.compare('123456', user.password);
      console.log('🔓 Admin login test:', isMatch ? 'SUCCESS' : 'FAILED');
    }
    
    mongoose.disconnect();
    console.log('\n🎯 All users now have password: 123456');
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

resetPasswords();
