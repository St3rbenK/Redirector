const { Campaign, Group } = require('../models');

exports.list = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      where: { userId: req.userId },
      include: [{ model: Group, as: 'groups' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar campanhas' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Nome e Slug são obrigatórios' });
    
    const existing = await Campaign.findOne({ where: { slug } });
    if (existing) return res.status(400).json({ error: 'Slug já está em uso' });

    const campaign = await Campaign.create({
      userId: req.userId,
      name,
      slug,
      description
    });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar campanha' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Campaign.destroy({ where: { id, userId: req.userId } });
    if (!deleted) return res.status(404).json({ error: 'Campanha não encontrada' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar campanha' });
  }
};
