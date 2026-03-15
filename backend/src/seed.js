const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const existing = await User.findOne({ where: { email: adminEmail } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        email: adminEmail,
        passwordHash,
        role: 'admin',
        planType: 'pro'
      });
      console.log('Admin user created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    } else {
      console.log('Admin user already exists.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err);
    process.exit(1);
  }
}

seed();
