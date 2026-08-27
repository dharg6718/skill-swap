const { findMatches } = require('../services/matchService');
const User = require('../models/User');
const { successResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.getMatches = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .populate('skillsKnown')
      .populate('skillsWanted');
      
    if (!currentUser) {
      return next(new AppError('User not found', 404));
    }

    const matches = await findMatches(currentUser);
    return successResponse(res, 'Matches fetched successfully', matches);
  } catch (error) {
    next(error);
  }
};

exports.getMatchesForUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId)
      .populate('skillsKnown')
      .populate('skillsWanted');

    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    const matches = await findMatches(targetUser);
    return successResponse(res, 'Matches fetched successfully', matches);
  } catch (error) {
    next(error);
  }
};
