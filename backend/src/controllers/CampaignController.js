const { Campaign, Group, User } = require('../models');

const PLAN_LIMITS = { 'free': 3, 'pro': 20, 'enterprise': 999999 };

exports.list = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({ where: { userId: req.userId }, include: [{ model: Group, as: 'groups' }], order: [['createdAt', 'DESC']] });
    res.json(campaigns);
  } catch (err) { res.status(500).json({ error: 'Erro ao listar' }); }
};

exports.create = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const user = await User.findByPk(req.userId);
    const campaignCount = await Campaign.count({ where: { userId: req.userId } });
    const limit = PLAN_LIMITS[user.planType] || 3;
    
    if (campaignCount >= limit) {
      return res.status(403).json({ error: `Limite do plano atingido (${limit} campanhas).` });
    }
    const existing = await Campaign.findOne({ where: { slug } });
    if (existing) return res.status(400).json({ error: 'Este slug já está em uso.' });
    
    const campaign = await Campaign.create({ userId: req.userId, name, slug, description });
    res.status(201).json(campaign);
  } catch (err) { res.status(400).json({ error: 'Erro ao criar' }); }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    const campaign = await Campaign.findOne({ where: { id, userId: req.userId } });
    if (!campaign) return res.status(404).json({ error: 'Campanha não encontrada.' });

    if (slug && slug !== campaign.slug) {
      const existing = await Campaign.findOne({ where: { slug } });
      if (existing) return res.status(400).json({ error: 'Este slug já está em uso.' });
    }

    campaign.name = name || campaign.name;
    campaign.slug = slug || campaign.slug;
    campaign.description = description || campaign.description;
    await campaign.save();
    res.json(campaign);
  } catch (err) { res.status(400).json({ error: 'Erro ao atualizar' }); }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await Campaign.destroy({ where: { id, userId: req.userId } });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: 'Erro ao deletar' }); }
};
