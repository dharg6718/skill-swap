const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { successResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.createReview = async (req, res, next) => {
  try {
    const { session: sessionId, rating, comment } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return next(new AppError('Session not found', 404));

    if (session.status !== 'completed') {
      return next(new AppError('Can only review completed sessions', 400));
    }

    const isMentor = session.mentor.toString() === req.user.id;
    const isLearner = session.learner.toString() === req.user.id;
    if (!isMentor && !isLearner) return next(new AppError('Not authorized', 403));

    const revieweeId = isMentor ? session.learner : session.mentor;

    const existingReview = await Review.findOne({ session: sessionId, reviewer: req.user.id });
    if (existingReview) {
      return next(new AppError('You have already reviewed this session', 400));
    }

    const review = await Review.create({
      session: sessionId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating,
      comment
    });

    const userReviews = await Review.find({ reviewee: revieweeId });
    const totalReviews = userReviews.length;
    const avgRating = userReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews;

    await User.findByIdAndUpdate(revieweeId, {
      rating: avgRating.toFixed(1),
      totalReviews
    });

    await createNotification({
      user: revieweeId,
      type: 'review',
      title: 'New Review Received',
      message: `${req.user.name} has left a review for your session.`,
      relatedId: review._id
    });

    return successResponse(res, 'Review created successfully', review, 201);
  } catch (error) {
    next(error);
  }
};

exports.getReviewsByUser = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .populate({
        path: 'session',
        populate: { path: 'skill', select: 'name' }
      })
      .sort('-createdAt');

    return successResponse(res, 'Reviews fetched successfully', reviews);
  } catch (error) {
    next(error);
  }
};
