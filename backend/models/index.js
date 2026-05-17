const sequelize = require('../config/database');
const User = require('./User');
const Announcement = require('./Announcement');
const CitizenPin = require('./CitizenPin');
const Visit = require('./Visit');

User.hasMany(Announcement, { foreignKey: 'created_by', as: 'announcements' });
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Announcement,
  CitizenPin,
  Visit,
};
