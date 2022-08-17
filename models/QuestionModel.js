const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: mongoose.Schema.Types.Array, required: true },
    answer: { type: String, required: true },
    status: { type: String, required: true, default: 'pending' },
    standard: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: [String], required: true },
    userId: { type: String, required: true },
    difficulty: { type: String, required: true, default: 'easy' },
    years: { type: mongoose.Schema.Types.Array, required: true },
    imageKey: { type: String, required: false, default: null },
    answerExplanation: { type: String, required: false, default: null },
    feedback: { type: String, required: false, default: null },
    similarQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Question', QuestionSchema);
