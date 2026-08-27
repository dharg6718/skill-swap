const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offeredSkill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  requestedSkill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  message: {
    type: String,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

swapRequestSchema.index({ sender: 1 });
swapRequestSchema.index({ receiver: 1 });
swapRequestSchema.index({ status: 1 });
swapRequestSchema.index({ sender: 1, receiver: 1, offeredSkill: 1, requestedSkill: 1, status: 1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
