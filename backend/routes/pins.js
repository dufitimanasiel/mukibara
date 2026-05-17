const express = require('express');
const { body } = require('express-validator');
const { getPins, createPin, updatePinStatus, verifyPin } = require('../controllers/pinController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/verify',
  [body('pin_code').trim().notEmpty().withMessage('PIN irasabwa.')],
  validate,
  verifyPin
);

router.get('/', authenticate, authorize('admin'), getPins);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  [body('pin_code').trim().notEmpty().withMessage('PIN code irasabwa.')],
  validate,
  createPin
);

router.put('/:id/status', authenticate, authorize('admin'), updatePinStatus);

module.exports = router;
