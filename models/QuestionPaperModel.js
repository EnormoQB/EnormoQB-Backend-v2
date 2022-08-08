const mongoose = require('mongoose');

const QuestionPaperSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    questionList: { type: mongoose.Schema.Types.Array, required: true },
    standard: { type: String, required: true },
    subject: { type: String, required: true },
    userId: { type: String, required: true },
    board: { type: String, required: true },
    questionDiff: { type: mongoose.Schema.Types.Mixed, required: true },
    instituteName: { type: String, required: false },
    examType: { type: String, required: false },
    instructions: { type: String, required: false },
    time: { type: String, required: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('QuestionPaper', QuestionPaperSchema);
