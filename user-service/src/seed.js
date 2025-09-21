require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI =
  process.env.USERS_DB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://mongo:27017/eco_users?replicaSet=rs0';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const adminEmail = 'admin@example.com';
    const userEmail = 'user@example.com';

    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      await User.create({
        email: adminEmail,
        password: await bcrypt.hash('AdminPass123!', 10),
        role: 'admin'
      });
      console.log('Seeded admin:', adminEmail);
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      await User.create({
        email: userEmail,
        password: await bcrypt.hash('UserPass123!', 10),
        role: 'user'
      });
      console.log('Seeded user:', userEmail);
    }
  } catch (err) {
    console.error('User seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('User seed complete.');
  }
})();
