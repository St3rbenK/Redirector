const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const user = await User.findOne({ where: { email: adminEmail } });
    
    if (!user) {
      // Cria do zero se não existir
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        email: adminEmail,
        passwordHash,
        role: 'admin',
        planType: 'enterprise' // Super Admin começa com tudo liberado
      });
      console.log(`SUCESSO: Super Admin criado (${adminEmail})`);
    } else {
      // Se o usuário já existe, garante que ele seja ADMIN e ENTERPRISE
      let updated = false;
      if (user.role !== 'admin') {
        user.role = 'admin';
        updated = true;
      }
      if (user.planType !== 'enterprise') {
        user.planType = 'enterprise';
        updated = true;
      }
      
      if (updated) {
        await user.save();
        console.log(`SUCESSO: Usuário ${adminEmail} promovido a Super Admin.`);
      } else {
        console.log(`INFO: Super Admin ${adminEmail} já está configurado corretamente.`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Erro no Seeder:', err);
    process.exit(1);
  }
}

seed();
