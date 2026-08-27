const express = require('express');
const { chat } = require('../controllers/chatController');
const { protect, activeUser } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, activeUser, chat);

module.exports = router;
