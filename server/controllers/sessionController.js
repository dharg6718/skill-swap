const Session = require('../models/Session');
const SwapRequest = require('../models/SwapRequest');
const { createNotification } = require('../services/notificationService');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.createSession = async (req, res, next) => {
  try {
    const requestId = req.body.request || req.body.requestId;
    const skill = req.body.skill || req.body.skillId;
    const scheduledAt = req.body.scheduledAt;
    const duration = req.body.duration || req.body.durationMinutes || 60;
    const meetingLink = req.body.meetingLink || '';
    const notes = req.body.notes || '';
    
    if (!requestId) {
      return next(new AppError('Swap request is required', 400));
    }
    if (!skill) {
      return next(new AppError('Skill is required', 400));
    }

    const request = await SwapRequest.findById(requestId);
    if (!request || request.status !== 'accepted') {
      return next(new AppError('Valid accepted swap request is required', 400));
    }

    const isSender = request.sender.toString() === req.user.id;
    const isReceiver = request.receiver.toString() === req.user.id;

    if (!isSender && !isReceiver) return next(new AppError('Not authorized', 403));

    let mentor, learner;
    if (skill.toString() === request.offeredSkill.toString()) {
      mentor = request.sender;
      learner = request.receiver;
    } else if (skill.toString() === request.requestedSkill.toString()) {
      mentor = request.receiver;
      learner = request.sender;
    } else {
      return next(new AppError('Skill must be one of the agreed swap skills', 400));
    }

    const session = await Session.create({
      request: requestId,
      mentor,
      learner,
      skill,
      scheduledAt,
      duration,
      meetingLink,
      notes
    });

    const otherUser = req.user.id === mentor.toString() ? learner : mentor;
    await createNotification({
      user: otherUser,
      type: 'session',
      title: 'New Session Scheduled',
      message: `A new session has been scheduled with you on ${new Date(scheduledAt).toLocaleDateString()}`,
      relatedId: session._id
    });

    return successResponse(res, 'Session scheduled successfully', session, 201);
  } catch (error) {
    next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { $or: [{ mentor: req.user.id }, { learner: req.user.id }] };
    if (req.query.status) query.status = req.query.status;

    const total = await Session.countDocuments(query);
    const sessions = await Session.find(query)
      .populate('mentor', 'name avatar rating')
      .populate('learner', 'name avatar rating')
      .populate('skill', 'name category')
      .populate('request')
      .sort('scheduledAt')
      .skip(skip)
      .limit(limit);

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    return paginatedResponse(res, 'Sessions fetched successfully', sessions, pagination);
  } catch (error) {
    next(error);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('mentor', 'name avatar rating')
      .populate('learner', 'name avatar rating')
      .populate('skill', 'name category')
      .populate('request');

    if (!session) return next(new AppError('Session not found', 404));

    if (session.mentor._id.toString() !== req.user.id && session.learner._id.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    return successResponse(res, 'Session fetched successfully', session);
  } catch (error) {
    next(error);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const { scheduledAt, duration, meetingLink, status, notes } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) return next(new AppError('Session not found', 404));

    if (session.mentor.toString() !== req.user.id && session.learner.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (session.status !== 'scheduled' && status && status !== session.status) {
      return next(new AppError('Cannot update a completed or cancelled session status', 400));
    }

    if (scheduledAt) session.scheduledAt = scheduledAt;
    if (duration) session.duration = duration;
    if (meetingLink !== undefined) session.meetingLink = meetingLink;
    if (notes !== undefined) session.notes = notes;
    if (status) {
      session.status = status;
      if (status === 'completed') {
        const otherUser = session.mentor.toString() === req.user.id ? session.learner : session.mentor;
        await createNotification({
          user: otherUser,
          type: 'review',
          title: 'Session Completed',
          message: 'Please leave a review for your recent session.',
          relatedId: session._id
        });
      }
    }

    await session.save();
    return successResponse(res, 'Session updated successfully', session);
  } catch (error) {
    next(error);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return next(new AppError('Session not found', 404));

    if (session.mentor.toString() !== req.user.id && session.learner.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (session.status !== 'scheduled') {
      return next(new AppError('Cannot delete a completed session', 400));
    }

    await session.deleteOne();
    return successResponse(res, 'Session deleted successfully', {});
  } catch (error) {
    next(error);
  }
};
