const { check } = require('express-validator');

exports.updateProfileValidation = [
  check('name', 'Name must be between 2 and 50 characters').optional().isLength({ min: 2, max: 50 }),
  check('bio', 'Bio cannot exceed 500 characters').optional().isLength({ max: 500 }),
  check('location').optional().isString(),
  check('skillsKnown', 'skillsKnown must be an array of MongoDB IDs').optional().isArray(),
  check('skillsKnown.*', 'Invalid MongoDB ID in skillsKnown').optional().isMongoId(),
  check('skillsWanted', 'skillsWanted must be an array of MongoDB IDs').optional().isArray(),
  check('skillsWanted.*', 'Invalid MongoDB ID in skillsWanted').optional().isMongoId()
];
