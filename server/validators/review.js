const { check } = require('express-validator');

exports.createReviewValidation = [
  check('session', 'Session is required and must be a valid MongoId').isMongoId(),
  check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
  check('comment', 'Comment cannot exceed 500 characters').optional().isLength({ max: 500 })
];
