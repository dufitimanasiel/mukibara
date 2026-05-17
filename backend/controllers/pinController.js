const { CitizenPin, Visit } = require('../models');

const getPins = async (req, res) => {
  try {
    const pins = await CitizenPin.findAll({
      order: [['created_at', 'DESC']],
    });
    res.json(pins);
  } catch (error) {
    console.error('Get pins error:', error);
    res.status(500).json({ message: 'Habaye ikosa mu kubona PIN.' });
  }
};

const createPin = async (req, res) => {
  try {
    const { pin_code } = req.body;

    if (!pin_code) {
      return res.status(400).json({ message: 'PIN code irasabwa.' });
    }

    const existing = await CitizenPin.findOne({ where: { pin_code } });
    if (existing) {
      return res.status(400).json({ message: 'Iyi PIN isanzweho.' });
    }

    const pin = await CitizenPin.create({ pin_code });
    res.status(201).json({ message: 'PIN yashyizweho neza!', pin });
  } catch (error) {
    console.error('Create pin error:', error);
    res.status(500).json({ message: 'Habaye ikosa mu gushyiraho PIN.' });
  }
};

const updatePinStatus = async (req, res) => {
  try {
    const pin = await CitizenPin.findByPk(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'PIN ntabwo ibonetse.' });
    }

    const { status } = req.body;
    if (!['active', 'hidden'].includes(status)) {
      return res.status(400).json({ message: 'Imiterere idakora.' });
    }

    await pin.update({ status });

    res.json({
      message: `PIN ${status === 'active' ? 'yatangijwe' : 'yarahishwe'} neza!`,
      pin,
    });
  } catch (error) {
    console.error('Update pin status error:', error);
    res.status(500).json({ message: 'Habaye ikosa.' });
  }
};

const verifyPin = async (req, res) => {
  try {
    const { pin_code } = req.body;

    if (!pin_code) {
      return res.status(400).json({ message: 'PIN code irasabwa.' });
    }

    const pin = await CitizenPin.findOne({ where: { pin_code } });

    if (!pin) {
      return res.status(401).json({ message: 'PIN ntabwo ari yo. Ongera ugerageze.' });
    }

    if (pin.status === 'hidden') {
      return res.status(403).json({ message: 'Kwinjira by\'abaturage byarahagaritswe.' });
    }

    await Visit.create({ visitor_type: 'citizen' });

    res.json({ message: 'Winjiye neza!', access: true });
  } catch (error) {
    console.error('Verify pin error:', error);
    res.status(500).json({ message: 'Habaye ikosa.' });
  }
};

module.exports = { getPins, createPin, updatePinStatus, verifyPin };
