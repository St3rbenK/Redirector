const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const CampaignController = require('../controllers/CampaignController');
const GroupController = require('../controllers/GroupController');
const authMiddleware = require('../middleware/auth');

// Auth
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// Campaigns
router.get('/campaigns', authMiddleware, CampaignController.list);
router.post('/campaigns', authMiddleware, CampaignController.create);
router.delete('/campaigns/:id', authMiddleware, CampaignController.delete);

// Groups
router.get('/groups/campaign/:campaignId', authMiddleware, GroupController.listByCampaign);
router.post('/groups', authMiddleware, GroupController.create);
router.delete('/groups/:id', authMiddleware, GroupController.delete);

module.exports = router;
