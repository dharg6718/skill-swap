const express = require('express');
const { createSession, getSessions, getSessionById, updateSession, deleteSession } = require('../controllers/sessionController');
const { createSessionValidation, updateSessionValidation } = require('../validators/session');
const validate = require('../middleware/validate');
const { protect, activeUser } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, activeUser, createSessionValidation, validate, createSession);
router.get('/', protect, getSessions);
router.get('/:id', protect, getSessionById);
router.put('/:id', protect, activeUser, updateSessionValidation, validate, updateSession);
router.delete('/:id', protect, deleteSession);

module.exports = router;
