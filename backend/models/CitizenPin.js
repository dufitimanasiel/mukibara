const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CitizenPin = sequelize.define('CitizenPin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  pin_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'hidden'),
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  tableName: 'citizen_pins',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = CitizenPin;
