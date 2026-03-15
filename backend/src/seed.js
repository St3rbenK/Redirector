const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // 1. REMOVER O BACKDOOR (admin@admin.com) se não for o e-mail oficial do ENV
    if (adminEmail !== 'admin@admin.com') {
      await User.destroy({ where: { email: 'admin@admin.com' } });
      console.log('BACKDOOR REMOVIDO: admin@admin.com não tem mais acesso.');
    }
    
    if (!adminEmail) {
      console.log('AVISO: ADMIN_EMAIL não definido no ENV. Pulando criação de super admin.');
      process.exit(0);
    }
    
    const user = await User.findOne({ where: { email: adminEmail } });
    
    if (!user) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        email: adminEmail,
        passwordHash,
        role: 'admin',
        planType: 'enterprise'
      });
      console.log(`SUCESSO: Super Admin criado (${adminEmail})`);
    } else {
      user.role = 'admin';
      user.planType = 'enterprise';
      await user.save();
      console.log(`SUCESSO: Usuário ${adminEmail} garantido como Super Admin.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Erro no Seeder:', err);
    process.exit(1);
  }
}

seed();
