const User = require('../models/User');
const Skill = require('../models/Skill');
const SwapRequest = require('../models/SwapRequest');
const Session = require('../models/Session');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    const pagination = { page, limit, total, pages: Math.ceil(total / limit) };
    return paginatedResponse(res, 'Users fetched', users, pagination);
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
      return next(new AppError('Cannot update your own status here', 400));
    }
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    user.isActive = !user.isActive;
    await user.save();
    return successResponse(res, 'User status updated', user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
      return next(new AppError('Cannot delete yourself', 400));
    }
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    await user.deleteOne();
    // In a real app we'd also delete/cascade related requests, sessions, reviews
    return successResponse(res, 'User deleted', {});
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalSkills = await Skill.countDocuments();
    const totalRequests = await SwapRequest.countDocuments();
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });

    const usersForRating = await User.find({ rating: { $gt: 0 } });
    const averagePlatformRating = usersForRating.length > 0
      ? (usersForRating.reduce((acc, u) => acc + u.rating, 0) / usersForRating.length).toFixed(1)
      : 0;

    // Additional charts data can be aggregated here
    // user registrations by month, request status breakdown, session status breakdown, skill category distribution
    const requestStatusBreakdownData = await SwapRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const requestStatusBreakdown = {};
    requestStatusBreakdownData.forEach(item => { requestStatusBreakdown[item._id] = item.count; });

    const sessionStatusBreakdownData = await Session.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const sessionStatusBreakdown = {};
    sessionStatusBreakdownData.forEach(item => { sessionStatusBreakdown[item._id] = item.count; });

    const skillCategoryDistributionData = await Skill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const skillCategoryDistribution = {};
    skillCategoryDistributionData.forEach(item => { skillCategoryDistribution[item._id] = item.count; });

    return successResponse(res, 'Admin stats fetched', {
      totalUsers,
      activeUsers,
      totalSkills,
      totalRequests,
      totalSessions,
      completedSessions,
      averagePlatformRating,
      requestStatusBreakdown,
      sessionStatusBreakdown,
      skillCategoryDistribution
    });
  } catch (error) {
    next(error);
  }
};
