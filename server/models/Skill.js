const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a skill name'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Programming', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Mobile', 'Design', 'Testing', 'Other']
  },
  description: {
    type: String,
    maxlength: 300,
    default: ''
  }
}, { timestamps: true });

skillSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
