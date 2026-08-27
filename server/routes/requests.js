const express = require('express');
const { createRequest, getRequests, getRequestById, updateRequest, deleteRequest } = require('../controllers/requestController');
const { createRequestValidation, updateRequestValidation } = require('../validators/request');
const validate = require('../middleware/validate');
const { protect, activeUser } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, activeUser, createRequestValidation, validate, createRequest);
router.get('/', protect, getRequests);
router.get('/:id', protect, getRequestById);
router.put('/:id', protect, activeUser, updateRequestValidation, validate, updateRequest);
router.delete('/:id', protect, deleteRequest);

module.exports = router;
