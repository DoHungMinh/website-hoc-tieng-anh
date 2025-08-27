const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb+srv://root:123@cluster0.z6bkumx.mongodb.net/english_learning_web?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' }
}, { timestamps: true });

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function testLogin() {
  try {
    console.log('\n🔍 Testing login for admin@test.com...');
    
    // Find user
    const user = await User.findOne({ email: 'admin@test.com' });
    if (!user) {
      console.log('❌ User not found');
      mongoose.disconnect();
      return;
    }
    
    console.log('✅ User found:', user.fullName);
    console.log('🔐 Password hash:', user.password.substring(0, 20) + '...');
    
    // Test password
    const isMatch = await user.comparePassword('123456');
    console.log('🔓 Password match:', isMatch);
    
    if (isMatch) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Password incorrect');
      
      // Try creating new hash for comparison
      const newHash = await bcrypt.hash('123456', 10);
      console.log('🆕 New hash would be:', newHash.substring(0, 20) + '...');
      
      const directCompare = await bcrypt.compare('123456', user.password);
      console.log('🔄 Direct bcrypt compare:', directCompare);
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

testLogin();
