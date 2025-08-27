const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb+srv://root:123@cluster0.z6bkumx.mongodb.net/english_learning_web?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User schema (simplified)
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('\n🔍 Checking existing users...');
    const users = await User.find({}, 'fullName email role createdAt').limit(10);
    
    if (users.length === 0) {
      console.log('📭 No users found in database');
      
      // Create a test user
      console.log('\n🆕 Creating test user...');
      const testUser = new User({
        fullName: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'user'
      });
      
      await testUser.save();
      console.log('✅ Test user created successfully');
    } else {
      console.log(`📊 Found ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName} (${user.email}) - ${user.role} - ${user.createdAt}`);
      });
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

checkUsers();
