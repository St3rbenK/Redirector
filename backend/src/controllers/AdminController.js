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
    const { password } = req.body;
    const user = await User.findByPk(req.userId);
    
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    res.json({ message: 'Perfil atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, role, planType } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role, planType });
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
