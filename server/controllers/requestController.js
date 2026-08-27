const SwapRequest = require('../models/SwapRequest');
const Skill = require('../models/Skill');
const { createNotification } = require('../services/notificationService');
const { successResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.createRequest = async (req, res, next) => {
  try {
    const receiver = req.body.receiver || req.body.receiverId;
    const offeredSkill = req.body.offeredSkill || req.body.offeredSkillId;
    const requestedSkill = req.body.requestedSkill || req.body.requestedSkillId;
    const message = req.body.message || '';
    
    if (!receiver || !offeredSkill || !requestedSkill) {
      return next(new AppError('Receiver, offered skill, and requested skill are required', 400));
    }

    if (receiver.toString() === req.user.id.toString()) {
      return next(new AppError('Cannot send request to yourself', 400));
    }

    const existingPending = await SwapRequest.findOne({
      sender: req.user.id,
      receiver,
      status: 'pending'
    });

    if (existingPending) {
      return next(new AppError('You already have a pending request with this user', 400));
    }

    const skillOffered = await Skill.findById(offeredSkill);
    const skillRequested = await Skill.findById(requestedSkill);

    if (!skillOffered || !skillRequested) {
      return next(new AppError('One or both skills not found', 404));
    }

    const request = await SwapRequest.create({
      sender: req.user.id,
      receiver,
      offeredSkill,
      requestedSkill,
      message: message || ''
    });

    await createNotification({
      user: receiver,
      type: 'swap_request',
      title: 'New Swap Request',
      message: `${req.user.name} wants to swap skills with you`,
      relatedId: request._id
    });

    return successResponse(res, 'Request sent successfully', request, 201);
  } catch (error) {
    next(error);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.type === 'incoming' || req.query.type === 'received') {
      query.receiver = req.user.id;
    } else if (req.query.type === 'outgoing' || req.query.type === 'sent') {
      query.sender = req.user.id;
    } else {
      query.$or = [{ sender: req.user.id }, { receiver: req.user.id }];
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const requests = await SwapRequest.find(query)
      .populate('sender', 'name avatar rating location')
      .populate('receiver', 'name avatar rating location')
      .populate('offeredSkill', 'name category')
      .populate('requestedSkill', 'name category')
      .sort('-createdAt');

    return successResponse(res, 'Requests fetched successfully', requests);
  } catch (error) {
    next(error);
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate('sender', 'name avatar rating location')
      .populate('receiver', 'name avatar rating location')
      .populate('offeredSkill', 'name category')
      .populate('requestedSkill', 'name category');

    if (!request) return next(new AppError('Request not found', 404));

    if (request.sender._id.toString() !== req.user.id && request.receiver._id.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    return successResponse(res, 'Request fetched successfully', request);
  } catch (error) {
    next(error);
  }
};

exports.updateRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await SwapRequest.findById(req.params.id);

    if (!request) return next(new AppError('Request not found', 404));
    if (request.status !== 'pending') return next(new AppError('Only pending requests can be updated', 400));

    if (status === 'accepted' || status === 'rejected') {
      if (request.receiver.toString() !== req.user.id) {
        return next(new AppError('Only the receiver can accept or reject', 403));
      }
      
      request.status = status;
      await request.save();

      await createNotification({
        user: request.sender,
        type: `request_${status}`,
        title: `Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
        message: `${req.user.name} has ${status} your swap request`,
        relatedId: request._id
      });
    } else if (status === 'cancelled') {
      if (request.sender.toString() !== req.user.id) {
        return next(new AppError('Only the sender can cancel', 403));
      }
      request.status = status;
      await request.save();
    } else {
      return next(new AppError('Invalid status', 400));
    }

    return successResponse(res, 'Request updated successfully', request);
  } catch (error) {
    next(error);
  }
};

exports.deleteRequest = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return next(new AppError('Request not found', 404));

    if (request.sender.toString() !== req.user.id) {
      return next(new AppError('Only sender can delete', 403));
    }
    if (request.status !== 'pending' && request.status !== 'cancelled') {
      return next(new AppError('Cannot delete accepted or rejected requests', 400));
    }

    await request.deleteOne();
    return successResponse(res, 'Request deleted successfully', {});
  } catch (error) {
    next(error);
  }
};
