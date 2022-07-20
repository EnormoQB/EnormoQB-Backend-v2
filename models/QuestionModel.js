const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: String, required: true },
    status: { type: String, required: true, default: 'pending' },
    standard: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: [String], required: true },
    imageUrl: { type: String, required: false },
    difficulty: { type: String, required: true, default: 'easy' },
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Question', QuestionSchema);
