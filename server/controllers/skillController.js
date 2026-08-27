const Skill = require('../models/Skill');
const User = require('../models/User');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.createSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;
    const existing = await Skill.findOne({ name: new RegExp('^' + name + '$', 'i') });
    if (existing) {
      return next(new AppError('Skill already exists', 400));
    }

    const skill = await Skill.create({ name, category, description });
    return successResponse(res, 'Skill created successfully', skill, 201);
  } catch (error) {
    next(error);
  }
};

exports.getSkills = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (!req.query.page && !req.query.limit) {
      const skills = await Skill.find(query).sort('name');
      return successResponse(res, 'Skills fetched successfully', skills);
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await Skill.countDocuments(query);
    const skills = await Skill.find(query)
      .sort('name')
      .skip(startIndex)
      .limit(limit);

    const pagination = { page, limit, total, pages: Math.ceil(total / limit) };
    return paginatedResponse(res, 'Skills fetched successfully', skills, pagination);
  } catch (error) {
    next(error);
  }
};

exports.getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return next(new AppError('Skill not found', 404));
    return successResponse(res, 'Skill fetched successfully', skill);
  } catch (error) {
    next(error);
  }
};

exports.updateSkill = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (name) {
      const existing = await Skill.findOne({ name: new RegExp('^' + name + '$', 'i'), _id: { $ne: req.params.id } });
      if (existing) return next(new AppError('Skill name already in use', 400));
    }

    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) return next(new AppError('Skill not found', 404));

    return successResponse(res, 'Skill updated successfully', skill);
  } catch (error) {
    next(error);
  }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return next(new AppError('Skill not found', 404));

    const usersUsingSkill = await User.countDocuments({
      $or: [{ skillsKnown: skill._id }, { skillsWanted: skill._id }]
    });

    if (usersUsingSkill > 0) {
      return next(new AppError('Cannot delete skill as it is being used by users', 400));
    }

    await skill.deleteOne();
    return successResponse(res, 'Skill deleted successfully', {});
  } catch (error) {
    next(error);
  }
};
