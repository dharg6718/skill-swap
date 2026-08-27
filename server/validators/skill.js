const { check } = require('express-validator');

exports.createSkillValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('category', 'Invalid category').isIn(['Programming', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Mobile', 'Design', 'Testing', 'Other']),
  check('description', 'Description cannot exceed 300 characters').optional().isLength({ max: 300 })
];

exports.updateSkillValidation = [
  check('name').optional().not().isEmpty(),
  check('category', 'Invalid category').optional().isIn(['Programming', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Mobile', 'Design', 'Testing', 'Other']),
  check('description', 'Description cannot exceed 300 characters').optional().isLength({ max: 300 })
];
