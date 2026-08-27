const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new AppError('User not found or session expired', 401));
    }

    next();
  } catch (error) {
    next(error);
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new AppError('Not authorized as an admin', 403));
  }
};

const activeUser = (req, res, next) => {
  if (req.user && req.user.isActive) {
    next();
  } else {
    next(new AppError('Your account has been deactivated', 403));
  }
};

module.exports = { protect, admin, activeUser };
