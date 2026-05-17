const express = require('express');
const { getUsers, updateUserStatus } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), getUsers);
router.put('/:id/status', authenticate, authorize('admin'), updateUserStatus);

module.exports = router;
