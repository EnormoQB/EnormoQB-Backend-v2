const Queue = require('bull');
const QuestionPaper = require('../models/QuestionPaperModel');
const Question = require('../models/QuestionModel');
const { PdfProcess } = require('./generateProcess');

const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST || 'localhost';

const paperQueue = new Queue('paperQueue', {
  redis: { port: redisPort, host: redisHost },
});

paperQueue.process(PdfProcess);

paperQueue.on('completed', async (job, result) => {
  console.log(job.data, result, 'completed');
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

const createPaper = async (id) => {
  try {
    console.log(`Creating paper for ${id}`);
    await paperQueue.add(id, {
      attempt: 2,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { createPaper, paperQueue };
