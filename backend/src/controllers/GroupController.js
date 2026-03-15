const { Group, Campaign } = require('../models');

exports.listByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findOne({ where: { id: campaignId, userId: req.userId } });
    if (!campaign) return res.status(404).json({ error: 'Campanha não encontrada' });

    const groups = await Group.findAll({ where: { campaignId } });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar grupos' });
  }
};

exports.create = async (req, res) => {
  try {
    const { campaignId, name, link, maxClicks } = req.body;
    if (!campaignId || !name || !link) return res.status(400).json({ error: 'Dados incompletos' });

    const campaign = await Campaign.findOne({ where: { id: campaignId, userId: req.userId } });
    if (!campaign) return res.status(404).json({ error: 'Campanha não encontrada' });

    const group = await Group.create({ campaignId, name, link, maxClicks });
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar grupo' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findOne({
      where: { id },
      include: [{ model: Campaign, as: 'campaign', where: { userId: req.userId } }]
    });

    if (!group) return res.status(404).json({ error: 'Grupo não encontrado' });

    await group.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar grupo' });
  }
};
