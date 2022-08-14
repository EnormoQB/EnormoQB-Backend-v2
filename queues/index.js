const Queue = require('bull');
const QuestionPaper = require('../models/QuestionPaperModel');
const Question = require('../models/QuestionModel');
const { PdfProcess } = require('./generateProcess');

const paperQueue = new Queue('paperQueue', {
  defaultJobOptions: {
    removeOnComplete: true,
  },
});

paperQueue.on('completed', async (job, result) => {
  const paperData = await QuestionPaper.findById(result);
  paperData.status = 'completed';
  paperData.PdfKey = result;
  paperData.ansKey = result;
  const year = new Date().getFullYear();
  const finalList = await Promise.all(
    paperData.questionList.map(async (item) => {
      if (item._id) {
        const question = await Question.findById(item._id);
        question.year.push_back(year);
        return item._id;
      }
    }),
  );
  paperData.questionList = finalList;
  await paperData.save();
});

// paperQueue.process(PdfProcess);

const CreatePaper = async (id) => {
  try {
    await paperQueue.add(id).then(() => {
      console.log('added');
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { CreatePaper, paperQueue };
