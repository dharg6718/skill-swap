const express = require('express');
const { createSkill, getSkills, getSkillById, updateSkill, deleteSkill } = require('../controllers/skillController');
const { createSkillValidation, updateSkillValidation } = require('../validators/skill');
const validate = require('../middleware/validate');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSkills);
router.get('/:id', getSkillById);
router.post('/', protect, admin, createSkillValidation, validate, createSkill);
router.put('/:id', protect, admin, updateSkillValidation, validate, updateSkill);
router.delete('/:id', protect, admin, deleteSkill);

module.exports = router;
