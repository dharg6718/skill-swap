const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('User already exists', 400));
    }

    let user = await User.create({
      name,
      email,
      password
    });

    user = await User.findById(user._id).populate('skillsKnown').populate('skillsWanted');
    const token = generateToken(user._id);

    return successResponse(res, 'User registered successfully', { user, token }, 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('skillsKnown').populate('skillsWanted');
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated', 403));
    }

    const token = generateToken(user._id);
    const userObj = user.toJSON();
    delete userObj.password;

    return successResponse(res, 'Logged in successfully', { user: userObj, token });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('skillsKnown')
      .populate('skillsWanted');
      
    return successResponse(res, 'User data retrieved', { user });
  } catch (error) {
    next(error);
  }
};
