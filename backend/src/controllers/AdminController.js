const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['passwordHash'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.userId);
    
    // Validar Senha Antiga para qualquer alteração sensível
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    if (name) user.name = name;
    
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ error: 'Este e-mail já está em uso' });
      user.email = email;
    }
    
    if (newPassword) {
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }
    
    await user.save();
    
    res.json({ 
      message: 'Perfil atualizado com sucesso',
      user: { id: user.id, email: user.email, name: user.name, role: user.role, planType: user.planType }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, role, planType, name } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role, planType, name });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar usuário' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.userId) return res.status(400).json({ error: 'Você não pode se excluir' });
    await User.destroy({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
};
