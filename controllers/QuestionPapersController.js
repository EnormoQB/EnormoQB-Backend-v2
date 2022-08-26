const moment = require('moment');
const fetch = require('node-fetch');
const apiResponse = require('../helpers/apiResponse');
const Question = require('../models/QuestionModel');
const logger = require('../helpers/winston');
const QuestionPaper = require('../models/QuestionPaperModel');
const { createPaper } = require('../queues/index');

const helperFn = async (
  type,
  ans,
  tough,
  filter,
  idList,
  topic = null,
  limit = 0,
) => {
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
    console.log(topicsDistribution);
    console.log(req.body);
    for (let i = 0; i < topicsDistribution.length; i += 1) {
      const topic = topicsDistribution[i];
      let y = 0;
      filter.topic = { $in: topic.name };
      while (topic.count > 0 && y < 3) {
        if (topic.count > 0 && easy > 0) {
          len = await helperFn(easy, ans, 'easy', filter, idList, topic);
          easy -= len;
          topic.count -= len;
        }
        if (topic.count > 0 && medium > 0) {
          len = await helperFn(medium, ans, 'medium', filter, idList, topic);
          medium -= len;
          topic.count -= len;
        }
        if (topic.count > 0 && hard > 0) {
          len = await helperFn(
            hard,
            ans,
            'hard',
            filter,
            idList,
            topic,
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
      console.log(filter);
      let items;
      if (easy > 0) {
        len = await helperFn(easy, ans, 'easy', filter, idList, null, easy);
        totalQuestions -= len;
      }
      if (medium > 0) {
        len = await helperFn(easy, ans, 'medium', filter, idList, null, medium);
        totalQuestions -= len;
      }
      if (hard > 0) {
        len = await helperFn(easy, ans, 'hard', filter, idList, null, hard);
        totalQuestions -= len;
      }
      if (totalQuestions > 0) {
        filter.difficulty = { $in: ['easy', 'medium', 'hard'] };
        items = await Question.find(filter).limit(totalQuestions);
        items.forEach((item) => {
          ans.push(item);
          idList.push(item._id);
        });
      }
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

const languageConverter = async (req, res, next) => {
  try {
    const { questionList, lang } = req.body;
    const result = [];
    for (let i = 0; i < questionList.length; i += 1) {
      const obj = {
        question: '',
        options: [],
      };
      await fetch(
        'https://hf.space/embed/ai4bharat/IndicTrans-English2Indic/+/api/predict/',
        {
          method: 'POST',
          body: JSON.stringify({ data: [`${questionList[i].question}`, lang] }),
          headers: { 'Content-Type': 'application/json' },
        },
      )
        .then((response) => response.json())
        .then((jsonResponse) => {
          // eslint-disable-next-line prefer-destructuring
          obj.question = jsonResponse.data[0];
        });
      for (let y = 0; y < questionList[i].options.length; y += 1) {
        await fetch(
          'https://hf.space/embed/ai4bharat/IndicTrans-English2Indic/+/api/predict/',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [`${questionList[i].options[y]}`, lang],
            }),
          },
        )
          .then((response) => response.json())
          .then((jsonResponse) => {
            obj.options.push(jsonResponse.data[0]);
          });
      }
      result.push(obj);
    }
    apiResponse.successResponseWithData(res, 'Successfully converted to the given language', result);
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};
const generatePaperName = (institute, standard, examType, board, subject) => {
  const date = moment().format('DD-MM-YYYY');
  if (institute && examType && standard && subject) {
    return `${institute} | ${examType} | ${date}`;
  }

  if (institute && !examType && standard && subject) {
    return `${institute} | ${board} | ${date}`;
  }

  if (institute && standard && subject) {
    return `${institute} | ${standard} | ${subject} | ${date}`;
  }

  return `${board} | ${standard} | ${subject} | ${date}`;
};

const GeneratePaperModel = async (req, res, next) => {
  try {
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
      userId: req.user._id,
      questionList,
      standard,
      subject,
      examType,
      board,
      instructions,
      time,
      quesDiffDetails,
    });

    const paper = await newQuestionPaper.save().catch((err) => {
      logger.error('Error :', err);
      apiResponse.ErrorResponse(res, 'Error while adding Question Paper');
      next(err);
    });

    await createPaper(paper._id);
    apiResponse.successResponse(res, 'Successfully added');
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

const PreviousYear = async (req, res, next) => {
  try {
    const { standard, subject, board } = req.query;
    const date = moment().subtract(1, 'year');
    const filters = {
      ...(standard ? { standard: { $regex: standard, $options: 'i' } } : {}),
      ...(subject ? { subject: { $regex: subject, $options: 'i' } } : {}),
      ...(board ? { board: { $regex: board, $options: 'i' } } : {}),
      createdAt: { $lte: date },
    };
    const paper = await QuestionPaper.find(filters);
    await apiResponse.successResponseWithData(res, 'Success', paper);
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};
const UserGeneratedPaper = async (req, res, next) => {
  try {
    const { standard, subject, board } = req.query;
    const filters = {
      ...(standard ? { standard: { $regex: standard, $options: 'i' } } : {}),
      ...(subject ? { subject: { $regex: subject, $options: 'i' } } : {}),
      ...(board ? { board: { $regex: board, $options: 'i' } } : {}),
      userId: req.user._id,
    };
    const paper = await QuestionPaper.find(filters);
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
  PreviousYear,
  UserGeneratedPaper,
  languageConverter,
};
