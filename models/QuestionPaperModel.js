const mongoose = require('mongoose');
const Question = require('./QuestionModel');

const QuestionPaperSchema = new mongoose.Schema(
  {
    questionList: { type: [], required: true },
    standard: { type: String, required: true },
    subject: { type: String, required: true },
    userId: { type: String, required: true },
    board: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('QuestionPaper', QuestionPaperSchema);
