const express = require('express');
const { body } = require('express-validator');
const {
  getAnnouncements,
  getPublicAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/public', getPublicAnnouncements);

router.get('/', authenticate, getAnnouncements);

router.get('/:id', getAnnouncementById);

router.post(
  '/',
  authenticate,
  authorize('admin', 'manager'),
  upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('Umutwe w\'itangazo urasabwa.'),
    body('message').trim().notEmpty().withMessage('Ubutumwa burasabwa.'),
  ],
  validate,
  createAnnouncement
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  upload.single('image'),
  updateAnnouncement
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  deleteAnnouncement
);

module.exports = router;
