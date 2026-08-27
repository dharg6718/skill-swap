const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { updateProfileValidation } = require('../validators/user');
const validate = require('../middleware/validate');
const { protect, activeUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, activeUser, updateProfileValidation, validate, updateUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;
