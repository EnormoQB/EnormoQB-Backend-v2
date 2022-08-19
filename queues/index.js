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
  const paperData = await QuestionPaper.findByIdAndUpdate(result, {
    status: 'completed',
    PdfKey: `${result}questionKey`,
    ansKey: `${result}answerkey`,
  });
  const year = new Date().getFullYear();
  const finalList = await Promise.all(
    paperData.questionList.map(async (item) => {
      if (item._id) {
        const question = await Question.findById(item._id);
        if (question.years) question.years.push(year);
        else question.years = [year];
        await question.save();
        return item._id;
      }
    }),
  );
  paperData.questionList = finalList;
  await paperData.save();
});

paperQueue.on('error', (error) => {
  console.log(error);
});

paperQueue.on('waiting', (jobId) => {
  console.log(jobId);
});

paperQueue.on('failed', (job, err) => {
  console.log(job, err);
});

const createPaper = async (id) => {
  try {
    console.log(`Creating paper for ${id}`);
    await paperQueue.add(id, { attempt: 2 });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { createPaper, paperQueue };
