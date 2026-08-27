const { check, oneOf } = require('express-validator');

exports.createSessionValidation = [
  check('scheduledAt', 'ScheduledAt is required and must be a valid date').isISO8601(),
  check('duration', 'Duration is required and must be between 15 and 480 minutes').optional().isInt({ min: 15, max: 480 }),
  check('meetingLink', 'MeetingLink must be a valid URL').optional({ checkFalsy: true }).isURL(),
  check('notes', 'Notes cannot exceed 1000 characters').optional().isLength({ max: 1000 })
];

exports.updateSessionValidation = [
  check('scheduledAt', 'ScheduledAt must be a valid date').optional().isISO8601(),
  check('duration', 'Duration must be between 15 and 480 minutes').optional().isInt({ min: 15, max: 480 }),
  check('meetingLink', 'MeetingLink must be a valid URL').optional({ checkFalsy: true }).isURL(),
  check('status', 'Status must be valid').optional().isIn(['scheduled', 'completed', 'cancelled']),
  check('notes', 'Notes cannot exceed 1000 characters').optional().isLength({ max: 1000 })
];
