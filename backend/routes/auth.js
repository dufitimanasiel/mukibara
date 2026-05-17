const express = require('express');
const { body } = require('express-validator');
const { login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Izina rirasabwa.'),
    body('password').notEmpty().withMessage('Ijambo ry\'ibanga rirasabwa.'),
  ],
  validate,
  login
);

router.get('/profile', authenticate, getProfile);

module.exports = router;
