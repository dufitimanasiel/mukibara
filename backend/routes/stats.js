const express = require('express');
const { getStats } = require('../controllers/statsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), getStats);

module.exports = router;
