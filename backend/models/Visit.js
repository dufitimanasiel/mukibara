const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  visitor_type: {
    type: DataTypes.ENUM('admin', 'manager', 'citizen'),
    allowNull: false,
  },
}, {
  tableName: 'visits',
  timestamps: true,
  createdAt: 'visited_at',
  updatedAt: false,
});

module.exports = Visit;
