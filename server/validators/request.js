const { check } = require('express-validator');

exports.createRequestValidation = [
  check('message', 'Message cannot exceed 500 characters').optional().isLength({ max: 500 })
];

exports.updateRequestValidation = [
  check('status', 'Status is required and must be valid').isIn(['pending', 'accepted', 'rejected', 'cancelled'])
];
