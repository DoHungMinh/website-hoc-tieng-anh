const mongoose = require('mongoose');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb+srv://root:123@cluster0.z6bkumx.mongodb.net/english_learning_web?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const allUsers = await User.find({}, { email: 1, accountStatus: 1, role: 1 });
    console.log('\n=== ALL USERS ===');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - accountStatus: '${user.accountStatus}' - role: '${user.role}'`);
    });
    
    const total = await User.countDocuments();
    const active = await User.countDocuments({ accountStatus: 'active' });
    const disabled = await User.countDocuments({ accountStatus: 'disabled' });
    const withoutStatus = await User.countDocuments({ accountStatus: { $exists: false } });
    const nullStatus = await User.countDocuments({ accountStatus: null });
    
    console.log('\n=== STATISTICS ===');
    console.log(`Total users: ${total}`);
    console.log(`Active users: ${active}`);
    console.log(`Disabled users: ${disabled}`);
    console.log(`Users without accountStatus field: ${withoutStatus}`);
    console.log(`Users with null accountStatus: ${nullStatus}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
