const bcrypt = require('bcryptjs');
const { User, CitizenPin } = require('../models');

const seedDatabase = async () => {
  try {
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'mukibara@123!',
        role: 'admin',
        status: 'active',
      });
      console.log('Admin user created');
    }

    const managerExists = await User.findOne({ where: { username: 'mukibara' } });
    if (!managerExists) {
      await User.create({
        username: 'mukibara',
        password: 'umuyobozi@123!',
        role: 'manager',
        status: 'active',
      });
      console.log('Manager user created');
    }

    const pinExists = await CitizenPin.findOne({ where: { pin_code: '*13672#' } });
    if (!pinExists) {
      await CitizenPin.create({
        pin_code: '*13672#',
        status: 'active',
      });
      console.log('Citizen PIN created');
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = seedDatabase;
