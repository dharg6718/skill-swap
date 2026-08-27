const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/auth');
const validate = require('../middleware/validate');
const { protect, activeUser } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, activeUser, getMe);

module.exports = router;
