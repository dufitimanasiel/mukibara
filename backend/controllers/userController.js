const { User } = require('../models');

const getUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await User.findAll({
      where,
      attributes: ['id', 'username', 'role', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Habaye ikosa mu kubona abakoresha.' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Umukoresha ntabwo abonetse.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Ntushobora guhindura imiterere ya admin.' });
    }

    const { status } = req.body;
    if (!['active', 'hidden'].includes(status)) {
      return res.status(400).json({ message: 'Imiterere idakora. Koresha: active, hidden' });
    }

    await user.update({ status });

    res.json({
      message: `Umukoresha ${status === 'active' ? 'yatangijwe' : 'yarahishwe'} neza!`,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Habaye ikosa.' });
  }
};

module.exports = { getUsers, updateUserStatus };
