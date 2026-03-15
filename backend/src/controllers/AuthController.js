const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Usuário já existe' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    // ENVIAR ROLE E PLAN PARA O FRONTEND
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email,
        role: user.role,
        planType: user.planType
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
};
