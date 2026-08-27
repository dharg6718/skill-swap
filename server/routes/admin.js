const express = require('express');
const { getUsers, updateUserStatus, deleteUser, getStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/users', protect, admin, getUsers);
router.put('/users/:id/status', protect, admin, updateUserStatus);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/stats', protect, admin, getStats);

module.exports = router;
