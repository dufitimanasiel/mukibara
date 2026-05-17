const jwt = require('jsonwebtoken');
const { User, Visit } = require('../models');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Izina n\'ijambo ry\'ibanga birasabwa.' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Izina cyangwa ijambo ry\'ibanga ntibikora.' });
    }

    if (user.status === 'hidden') {
      return res.status(403).json({ message: 'Konti yawe yarahagaritswe. Menyesha umuyobozi.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Izina cyangwa ijambo ry\'ibanga ntibikora.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await Visit.create({ visitor_type: user.role });

    res.json({
      message: 'Winjiye neza!',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Habaye ikosa. Ongera ugerageze.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'role', 'status', 'created_at'],
    });
    if (!user) {
      return res.status(404).json({ message: 'Umukoresha ntabwo abonetse.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Habaye ikosa.' });
  }
};

module.exports = { login, getProfile };
