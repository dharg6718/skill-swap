const User = require('../models/User');
const Skill = require('../models/Skill');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    const query = { isActive: true };

    // Exclude current logged in user from explore discovery if authenticated
    if (req.user && req.user.id) {
      query._id = { $ne: req.user.id };
    }

    const searchTerm = req.query.search || req.query.name;
    if (searchTerm && searchTerm.trim()) {
      query.$or = [
        { name: { $regex: searchTerm.trim(), $options: 'i' } },
        { bio: { $regex: searchTerm.trim(), $options: 'i' } },
        { location: { $regex: searchTerm.trim(), $options: 'i' } }
      ];
    }

    if (req.query.location && req.query.location.trim()) {
      query.location = { $regex: req.query.location.trim(), $options: 'i' };
    }

    if (req.query.rating || req.query.minRating) {
      const minRating = parseFloat(req.query.rating || req.query.minRating);
      if (!isNaN(minRating)) {
        query.rating = { $gte: minRating };
      }
    }

    // Filter by specific skill ID or skill name
    if (req.query.skill && req.query.skill !== '') {
      let skillId = req.query.skill;
      // If it's a string name rather than ObjectId
      if (!skillId.match(/^[0-9a-fA-F]{24}$/)) {
        const foundSkills = await Skill.find({ name: { $regex: skillId, $options: 'i' } }).select('_id');
        const skillIds = foundSkills.map(s => s._id);
        if (skillIds.length > 0) {
          query.$or = [
            ...(query.$or || []),
            { skillsKnown: { $in: skillIds } },
            { skillsWanted: { $in: skillIds } }
          ];
        }
      } else {
        query.$or = [
          ...(query.$or || []),
          { skillsKnown: skillId },
          { skillsWanted: skillId }
        ];
      }
    }

    // Filter by skill category
    if (req.query.category && req.query.category !== '') {
      const categorySkills = await Skill.find({ category: req.query.category }).select('_id');
      const catSkillIds = categorySkills.map(s => s._id);
      if (catSkillIds.length > 0) {
        query.$or = [
          ...(query.$or || []),
          { skillsKnown: { $in: catSkillIds } },
          { skillsWanted: { $in: catSkillIds } }
        ];
      }
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('skillsKnown')
      .populate('skillsWanted')
      .sort('-rating -createdAt')
      .skip(startIndex)
      .limit(limit)
      .lean();

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    };

    return paginatedResponse(res, 'Users fetched successfully', users, pagination);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('skillsKnown')
      .populate('skillsWanted')
      .lean();

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return successResponse(res, 'User fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this user', 403));
    }

    const { name, bio, location, avatar, skillsKnown, skillsWanted } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (skillsKnown) updateData.skillsKnown = skillsKnown;
    if (skillsWanted) updateData.skillsWanted = skillsWanted;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('skillsKnown').populate('skillsWanted');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return successResponse(res, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this user', 403));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await user.deleteOne();
    return successResponse(res, 'User deleted successfully', {});
  } catch (error) {
    next(error);
  }
};
