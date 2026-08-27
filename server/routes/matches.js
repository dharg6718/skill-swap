const express = require('express');
const { getMatches, getMatchesForUser } = require('../controllers/matchController');
const { protect, activeUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, activeUser, getMatches);
router.get('/:userId', protect, activeUser, getMatchesForUser);

module.exports = router;
