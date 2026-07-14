// One-off script to create an admin account, since the public API only
// exposes resident self-registration. Run with: node src/utils/seedAdmin.js
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../constants/enums');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@society.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log(`Admin already exists with email: ${adminEmail}`);
  } else {
    await User.create({
      name: 'Society Admin',
      email: adminEmail,
      password: adminPassword,
      phone: '9999999999',
      flatNumber: 'ADMIN',
      role: ROLES.ADMIN
    });
    console.log(`Admin created successfully: ${adminEmail} / ${adminPassword}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(`Failed to seed admin: ${err.message}`);
  process.exit(1);
});
