const express = require('express');
const { createReview, getReviewsByUser } = require('../controllers/reviewController');
const { createReviewValidation } = require('../validators/review');
const validate = require('../middleware/validate');
const { protect, activeUser } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, activeUser, createReviewValidation, validate, createReview);
router.get('/user/:userId', protect, getReviewsByUser);

module.exports = router;
