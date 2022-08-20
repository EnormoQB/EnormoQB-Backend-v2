const Queue = require('bull');
const QuestionPaper = require('../models/QuestionPaperModel');
const Question = require('../models/QuestionModel');
const { PdfProcess } = require('./generateProcess');
const logger = require('../helpers/winston');

const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST || 'localhost';

const paperQueue = new Queue('paperQueue', {
  redis: { port: redisPort, host: redisHost },
});

paperQueue.process(PdfProcess);

paperQueue.on('completed', async (job, result) => {
  const { id, questionKey, answerKey } = result;
  const paperData = await QuestionPaper.findByIdAndUpdate(id, {
    status: 'completed',
    questionKey,
    answerKey,
  });
  const year = new Date().getFullYear();
  const finalList = await Promise.all(
    paperData.questionList.map(async (item) => {
      if (!Object.prototype.hasOwnProperty.call(item, 'custom')) {
        const question = await Question.findById(item._id);
        if (question.years) question.years.push(year);
        else question.years = [year];
        await question.save();
        return item._id;
      }
      return null;
    }),
  );
  paperData.questionList = finalList;
  await paperData.save();
});

paperQueue.on('error', (error) => {
  logger.error('Job error', error);
});

paperQueue.on('waiting', (jobId) => {
  logger.info('Job waiting', jobId);
});

paperQueue.on('failed', (job, err) => {
  logger.error('Job failed', job, err);
});

const createPaper = async (id) => {
  try {
    logger.info(`Creating paper for ${id}`);
    await paperQueue.add(id, { attempt: 2 });
  } catch (err) {
    logger.error('Error', err);
  }
};

module.exports = { createPaper, paperQueue };
