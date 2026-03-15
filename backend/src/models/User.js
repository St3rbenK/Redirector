const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: true }, // NOVO CAMPO
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  planType: { type: DataTypes.STRING, defaultValue: 'free', field: 'plan_type' },
  lastLogin: { type: DataTypes.DATE, field: 'last_login' }
}, { tableName: 'users', underscored: true, timestamps: true });

module.exports = User;
