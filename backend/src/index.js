const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { sequelize, Campaign, Group } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', require('./routes/api'));

// Lógica de Redirecionamento Avançada
app.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (slug.includes('.') || ['login', 'dashboard', 'health'].includes(slug)) return next();

    const campaign = await Campaign.findOne({
      where: { slug, active: true },
      include: [{ model: Group, as: 'groups', where: { active: true } }]
    });

    if (!campaign || !campaign.groups || campaign.groups.length === 0) return next();

    let availableGroups = [];
    
    // Filtra grupos disponíveis (considerando o valor -1 como ILIMITADO)
    availableGroups = campaign.groups.filter(g => g.maxClicks === -1 || g.currentClicks < g.maxClicks);

    if (availableGroups.length === 0) {
      return res.status(404).send(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 100px; background: #f9fafb; min-height: 100vh;">
          <h1 style="color: #111827; font-size: 48px; font-weight: 900; letter-spacing: -2px;">CAMPANHA LOTADA</h1>
          <p style="color: #6b7280; font-weight: 600;">Todos os destinos atingiram a capacidade máxima configurada.</p>
        </div>
      `);
    }

    let selectedGroup;

    // Lógica baseada no modo da campanha (Padrão: Smart Balance se não definido)
    // No frontend vamos permitir escolher
    const mode = campaign.description?.includes('MODE:SEQUENTIAL') ? 'sequential' : 'balance';

    if (mode === 'sequential') {
      // Pega o primeiro da lista que ainda tem vaga
      selectedGroup = availableGroups[0];
    } else {
      // Smart Balance: Pega o que tem menos cliques atuais
      selectedGroup = availableGroups.sort((a, b) => a.currentClicks - b.currentClicks)[0];
    }

    selectedGroup.increment('currentClicks');
    selectedGroup.increment('clickCount');

    return res.redirect(selectedGroup.link);
  } catch (error) {
    console.error('Redirect error:', error);
    next();
  }
});

const frontendPath = path.join(__dirname, '../public');
app.use(express.static(frontendPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(PORT, '0.0.0.0', () => console.log(`REDIRECTOR Running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start:', error);
  }
};

start();
