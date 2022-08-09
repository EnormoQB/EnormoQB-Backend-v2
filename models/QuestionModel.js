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
    imageKey: { type: String, required: false, default: null },
    difficulty: { type: String, required: true, default: 'easy' },
    userId: { type: String, required: true },
    answerExplaination: { type: String, required: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Question', QuestionSchema);
