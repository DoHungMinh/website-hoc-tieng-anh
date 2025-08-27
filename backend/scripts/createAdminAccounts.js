const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define User schema (same as in models/User.ts)
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Admin accounts to create
const adminAccounts = [
  {
    fullName: 'Admin Chính',
    email: 'admin@shopcong.io.vn',
    phone: '+84901234567',
    password: 'Admin123!@#',
    role: 'admin'
  },
  {
    fullName: 'Quản lý Hệ thống',
    email: 'manager@shopcong.io.vn',
    phone: '+84901234568',
    password: 'Manager123!@#',
    role: 'admin'
  },
  {
    fullName: 'Quản trị Hệ thống',
    email: 'system@shopcong.io.vn',
    phone: '+84901234569',
    password: 'System123!@#',
    role: 'admin'
  },
  {
    fullName: 'Giáo viên Chính',
    email: 'teacher@shopcong.io.vn',
    phone: '+84901234570',
    password: 'Teacher123!@#',
    role: 'admin'
  }
];

async function createAdminAccounts() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/english-learning-db';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    for (const adminData of adminAccounts) {
      try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        
        if (existingAdmin) {
          console.log(`Admin ${adminData.email} already exists, skipping...`);
          continue;
        }

        // Create new admin
        const admin = new User(adminData);
        await admin.save();
        
        console.log(`✅ Created admin account: ${adminData.email}`);
        console.log(`   Name: ${adminData.fullName}`);
        console.log(`   Phone: ${adminData.phone}`);
        console.log(`   Password: ${adminData.password}`);
        console.log('');
        
      } catch (error) {
        console.error(`❌ Error creating admin ${adminData.email}:`, error.message);
      }
    }

    console.log('✨ Admin account creation process completed!');
    console.log('\n📋 Summary of Admin Accounts:');
    console.log('==================================');
    
    for (const admin of adminAccounts) {
      console.log(`Email: ${admin.email}`);
      console.log(`Password: ${admin.password}`);
      console.log(`Name: ${admin.fullName}`);
      console.log('---');
    }

  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createAdminAccounts();
