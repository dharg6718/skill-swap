const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const { findMatches } = require('../services/matchService');
const { successResponse } = require('../utils/apiResponse');

exports.getStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('skillsKnown').populate('skillsWanted');
    
    const skillsOffered = user.skillsKnown?.length || 0;
    const skillsWanted = user.skillsWanted?.length || 0;
    
    const pendingRequests = await SwapRequest.countDocuments({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
      status: 'pending'
    });

    const totalRequests = await SwapRequest.countDocuments({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    });

    const totalSessions = await Session.countDocuments({
      $or: [{ mentor: req.user.id }, { learner: req.user.id }]
    });

    const totalMatches = (await findMatches(user)).length;

    const upcomingSessionsCount = await Session.countDocuments({
      $or: [{ mentor: req.user.id }, { learner: req.user.id }],
      status: 'scheduled',
      scheduledAt: { $gte: new Date() }
    });
    
    const completedSessions = await Session.countDocuments({
      $or: [{ mentor: req.user.id }, { learner: req.user.id }],
      status: 'completed'
    });
    
    const averageRating = user.rating || 0;
    const totalReviews = user.totalReviews || 0;

    const recentRequests = await SwapRequest.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
    .sort('-createdAt')
    .limit(5)
    .populate('sender receiver offeredSkill requestedSkill');

    const upcomingSessions = await Session.find({
      $or: [{ mentor: req.user.id }, { learner: req.user.id }],
      status: 'scheduled',
      scheduledAt: { $gte: new Date() }
    })
    .sort('scheduledAt')
    .limit(5)
    .populate('mentor learner skill request');

    const recentNotifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(5);

    // Calculate last 6 months sessions over time with month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthNum: d.getMonth() + 1,
        count: 0
      });
    }

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const sessionsOverTimeData = await Session.aggregate([
      {
        $match: {
          $or: [{ mentor: user._id }, { learner: user._id }],
          status: 'completed',
          updatedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$updatedAt' },
            year: { $year: '$updatedAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    sessionsOverTimeData.forEach(item => {
      const found = last6Months.find(m => m.monthNum === item._id.month && m.year === item._id.year);
      if (found) found.count = item.count;
    });

    const requestsBreakdown = await SwapRequest.aggregate([
      {
        $match: {
          $or: [{ sender: user._id }, { receiver: user._id }]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const requestStatusBreakdown = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0
    };
    requestsBreakdown.forEach(item => {
      if (item._id) requestStatusBreakdown[item._id] = item.count;
    });

    // Skill categories breakdown for current user's known & wanted skills
    const categoryCounts = {};
    [...(user.skillsKnown || []), ...(user.skillsWanted || [])].forEach(skill => {
      const cat = skill?.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const skillCategories = Object.keys(categoryCounts).map(name => ({
      name,
      value: categoryCounts[name]
    }));

    const matches = await findMatches(user);
    const topMatches = matches.slice(0, 4);

    return successResponse(res, 'Dashboard stats fetched', {
      totalMatches,
      totalRequests,
      totalSessions,
      avgRating: averageRating,
      skillsOffered,
      skillsWanted,
      pendingRequests,
      upcomingSessionsCount,
      completedSessions,
      averageRating,
      totalReviews,
      recentRequests,
      upcomingSessions,
      recentNotifications,
      sessionsOverTime: last6Months,
      sessionTimeline: last6Months.map(({ month, count }) => ({ month, sessions: count })),
      requestStatusBreakdown,
      skillCategories,
      topMatches
    });
  } catch (error) {
    next(error);
  }
};
