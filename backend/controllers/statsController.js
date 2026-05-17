const { User, Announcement, CitizenPin, Visit } = require('../models');

const getStats = async (req, res) => {
  try {
    const [
      totalAnnouncements,
      activeManagers,
      hiddenManagers,
      activePins,
      hiddenPins,
      totalVisits,
    ] = await Promise.all([
      Announcement.count(),
      User.count({ where: { role: 'manager', status: 'active' } }),
      User.count({ where: { role: 'manager', status: 'hidden' } }),
      CitizenPin.count({ where: { status: 'active' } }),
      CitizenPin.count({ where: { status: 'hidden' } }),
      Visit.count(),
    ]);

    const citizenVisits = await Visit.count({ where: { visitor_type: 'citizen' } });
    const managerVisits = await Visit.count({ where: { visitor_type: 'manager' } });
    const adminVisits = await Visit.count({ where: { visitor_type: 'admin' } });

    res.json({
      totalAnnouncements,
      activeManagers,
      hiddenManagers,
      activePins,
      hiddenPins,
      totalVisits,
      citizenVisits,
      managerVisits,
      adminVisits,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Habaye ikosa mu kubona imibare.' });
  }
};

module.exports = { getStats };
