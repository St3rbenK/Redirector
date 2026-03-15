const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  planType: { type: DataTypes.STRING, defaultValue: 'free', field: 'plan_type' },
  lastLogin: { type: DataTypes.DATE, field: 'last_login' }
}, { tableName: 'users', underscored: true, timestamps: true });

const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'campaigns', underscored: true, timestamps: true });

const Group = sequelize.define('Group', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  campaignId: { type: DataTypes.INTEGER, allowNull: false, field: 'campaign_id' },
  name: { type: DataTypes.STRING, allowNull: false },
  link: { type: DataTypes.STRING, allowNull: false },
  maxClicks: { type: DataTypes.INTEGER, defaultValue: 100, field: 'max_clicks' },
  currentClicks: { type: DataTypes.INTEGER, defaultValue: 0, field: 'current_clicks' },
  clickCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'click_count' },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'groups', underscored: true, timestamps: true });

// Associations
User.hasMany(Campaign, { foreignKey: 'userId', as: 'campaigns' });
Campaign.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Campaign.hasMany(Group, { foreignKey: 'campaignId', as: 'groups' });
Group.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });

module.exports = { sequelize, User, Campaign, Group };
