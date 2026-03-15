const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { sequelize, Campaign, Group } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. API Routes
app.use('/api', require('./routes/api'));

// 2. Redirection Logic (Prioridade antes do Frontend)
app.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // Ignorar requisições de arquivos comuns ou rotas do sistema
    if (slug.includes('.') || ['login', 'dashboard', 'health'].includes(slug)) {
      return next();
    }

    const campaign = await Campaign.findOne({
      where: { slug, active: true },
      include: [{
        model: Group,
        as: 'groups',
        where: { active: true }
      }]
    });

    if (!campaign || !campaign.groups || campaign.groups.length === 0) {
      return next(); // Deixa o frontend lidar com o 404 ou página não encontrada
    }

    const availableGroups = campaign.groups.filter(g => g.currentClicks < g.maxClicks);

    if (availableGroups.length === 0) {
      return res.status(404).send(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 100px; background: #f9fafb; min-height: 100vh;">
          <h1 style="color: #111827; font-size: 48px; font-weight: 900; letter-spacing: -2px;">CAMPANHA LOTADA</h1>
          <p style="color: #6b7280; font-weight: 600;">Todos os grupos atingiram a capacidade máxima.</p>
        </div>
      `);
    }

    const selectedGroup = availableGroups.sort((a, b) => a.currentClicks - b.currentClicks)[0];
    selectedGroup.increment('currentClicks');
    selectedGroup.increment('clickCount');

    return res.redirect(selectedGroup.link);
  } catch (error) {
    console.error('Redirect error:', error);
    next();
  }
});

// 3. Static Files (Frontend)
// A pasta 'public' conterá o build do React
const frontendPath = path.join(__dirname, '../public');
app.use(express.static(frontendPath));

// 4. SPA Routing
// Qualquer rota que não seja API ou Slug conhecido, serve o index.html do React
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`REDIRECTOR Running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start:', error);
  }
};

start();
