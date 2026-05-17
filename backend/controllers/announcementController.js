const { Op } = require('sequelize');
const { Announcement, User } = require('../models');

const getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (req.user && req.user.role === 'manager') {
      where.created_by = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'role'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      announcements: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Habaye ikosa mu kubona amatangazo.' });
  }
};

const getPublicAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { status: 'active' };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      announcements: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get public announcements error:', error);
    res.status(500).json({ message: 'Habaye ikosa mu kubona amatangazo.' });
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Itangazo ntiribonetse.' });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Habaye ikosa.' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, message, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const announcement = await Announcement.create({
      title,
      message,
      image,
      created_by: req.user.id,
      status: status || 'active',
    });

    const full = await Announcement.findByPk(announcement.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });

    res.status(201).json({ message: 'Itangazo ryashyizweho neza!', announcement: full });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Habaye ikosa mu gushyiraho itangazo.' });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Itangazo ntiribonetse.' });
    }

    if (req.user.role === 'manager' && announcement.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Nta burenganzira bwo guhindura iri tangazo.' });
    }

    const { title, message, status } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (message) updateData.message = message;
    if (status) updateData.status = status;
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    await announcement.update(updateData);

    const updated = await Announcement.findByPk(announcement.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });

    res.json({ message: 'Itangazo ryavuguruwe neza!', announcement: updated });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Habaye ikosa mu kuvugurura itangazo.' });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Itangazo ntiribonetse.' });
    }

    if (req.user.role === 'manager' && announcement.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Nta burenganzira bwo gusiba iri tangazo.' });
    }

    await announcement.destroy();
    res.json({ message: 'Itangazo ryasibwe neza!' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Habaye ikosa mu gusiba itangazo.' });
  }
};

module.exports = {
  getAnnouncements,
  getPublicAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
