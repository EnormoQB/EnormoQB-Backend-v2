const moment = require('moment');
const Queue = require('bull');
const apiResponse = require('../helpers/apiResponse');
const Question = require('../models/QuestionModel');
const logger = require('../helpers/winston');
const QuestionPaper = require('../models/QuestionPaperModel');
const { createPaper } = require('../queues/index');

const helperFn = async (topic, type, ans, tough, filter, idList, limit = 0) => {
  limit =
    limit === 0
      ? Math.floor(Math.random() * Math.min(topic.count + 1, type + 1))
      : limit;
  if (limit <= 0) {
    return 0;
  }
  filter.difficulty = { $regex: `${tough}`, $options: 'i' };
  const items = await Question.find(filter).limit(limit);
  items.forEach((item) => {
    ans.push(item);
    idList.push(item._id);
  });
  return items.length;
};

const GeneratePreview = async (req, res, next) => {
  try {
    const ans = [];
    const idList = [];
    let len = 0;
    let totalTopicQues = 0;
    let topicCovered = 0;
    const { subject, standard, topicsDistribution } = req.body;
    let { easy, medium, hard } = req.body;

    const filter = {
      ...(standard ? { standard: { $regex: standard, $options: 'i' } } : {}),
      ...(subject ? { subject: { $regex: subject, $options: 'i' } } : {}),
      status: { $regex: 'approved', $options: 'i' },
      _id: { $nin: idList },
    };

    topicsDistribution.forEach((topic) => {
      if (topic.count !== -1) {
        totalTopicQues += topic.count;
        topicCovered += 1;
      }
    });

    let totalQuestions = easy + medium + hard;
    let questionleft = totalQuestions;
    questionleft -= totalTopicQues;

    const topicsPerQuestion = Math.floor(
      questionleft / (topicsDistribution.length - topicCovered),
    );

    topicsDistribution.forEach((topic) => {
      if (topic.count === -1) {
        topic.count = topicsPerQuestion;
      }
    });

    for (let i = 0; i < topicsDistribution.length; i += 1) {
      const topic = topicsDistribution[i];
      let y = 0;
      filter.topic = { $in: topic.name };
      while (topic.count > 0 && y < 3) {
        if (topic.count > 0 && easy > 0) {
          len = await helperFn(topic, easy, ans, 'easy', filter, idList);
          easy -= len;
          topic.count -= len;
        }
        if (topic.count > 0 && medium > 0) {
          len = await helperFn(topic, medium, ans, 'medium', filter, idList);
          medium -= len;
          topic.count -= len;
        }
        if (topic.count > 0 && hard > 0) {
          len = await helperFn(
            topic,
            hard,
            ans,
            'hard',
            filter,
            idList,
            topic.count,
          );
          hard -= len;
          topic.count -= len;
        }
        y += 1;
      }
    }

    totalQuestions -= ans.length;
    if (totalQuestions > 0) {
      filter.topic = { $in: topicsDistribution.map((topic) => topic.name) };
      filter.difficulty = { $in: ['easy', 'medium', 'hard'] };
      const items = await Question.find(filter).limit(totalQuestions);
      items.forEach((item) => ans.push(item));
    }

    return apiResponse.successResponseWithData(
      res,
      'Paper Generated Successfully',
      ans,
    );
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

const generatePaperName = (institute, standard, examType, board, subject) => {
  const date = moment().format('DD MM YYYY');
  if (institute && examType && standard && subject) {
    return `${institute} ${examType} ${date}`;
  }

  if (institute && !examType && standard && subject) {
    return `${institute} ${board} ${date}`;
  }

  if (institute && standard && subject) {
    return `${institute} ${standard} ${subject} ${date}`;
  }

  return `${board} ${standard} ${subject} ${date}`;
};

const GeneratePaperModel = async (req, res, next) => {
  try {
    // const {
    //   instituteName,
    //   standard,
    //   subject,
    //   examType,
    //   questionList,
    //   board,
    //   instructions,
    //   time,
    //   quesDiffDetails,
    //   userId,
    // } = JSON.parse(req.body.data);
    const {
      instituteName,
      standard,
      subject,
      examType,
      questionList,
      board,
      instructions,
      time,
      quesDiffDetails,
      userId,
    } = req.body;

    const name = generatePaperName(
      instituteName,
      standard,
      examType,
      board,
      subject,
    );

    const newQuestionPaper = new QuestionPaper({
      name,
      instituteName,
      // userId: req.user._id,
      userId,
      questionList,
      standard,
      subject,
      examType,
      board,
      instructions,
      time,
      quesDiffDetails,
    });
    const paper = await newQuestionPaper
      .save()
      .catch((err) => {
        logger.error('Error :', err);
        apiResponse.ErrorResponse(res, 'Error while adding Question Paper');
        next(err);
      });
    req.paperId = paper._id;
    next();
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

const CreateNewPaper = async (req, res, next) => {
  try {
    await createPaper(req.paperId);
    apiResponse.successResponse(res, 'Successfully added');
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

const PreviousYear = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const date = new Date(year - 1, 12, 1);
    const paper = await QuestionPaper.find({ createdAt: { $lte: date } });
    await apiResponse.successResponseWithData(res, 'Success', paper);
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};
const UserGeneratedPaper = async (req, res, next) => {
  try {
    const paper = await QuestionPaper.find({ userId: req.user._id });
    await apiResponse.successResponseWithData(res, 'Success', paper);
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

module.exports = {
  GeneratePreview,
  GeneratePaperModel,
  CreateNewPaper,
  PreviousYear,
  UserGeneratedPaper,
};
