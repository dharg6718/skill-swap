const { check } = require('express-validator');

exports.registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('name', 'Name must be between 2 and 50 characters').trim().isLength({ min: 2, max: 50 }),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('confirmPassword').optional().custom((value, { req }) => {
    if (value && value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

exports.loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists()
];
