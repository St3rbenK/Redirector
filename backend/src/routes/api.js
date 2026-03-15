const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const CampaignController = require('../controllers/CampaignController');
const GroupController = require('../controllers/GroupController');
const AdminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

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

// Admin & Profile
router.put('/admin/profile', authMiddleware, AdminController.updateProfile);
router.get('/admin/users', authMiddleware, isAdmin, AdminController.listUsers);
router.post('/admin/users', authMiddleware, isAdmin, AdminController.createUser);
router.delete('/admin/users/:id', authMiddleware, isAdmin, AdminController.deleteUser);

module.exports = router;
