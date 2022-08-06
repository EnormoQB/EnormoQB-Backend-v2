const mongoose = require('mongoose');
const PdfMake = require('pdfmake');
const fs = require('fs');
const apiResponse = require('../helpers/apiResponse');
const Question = require('../models/QuestionModel');
const logger = require('../helpers/winston');
// const User = require('../models/UserModel');

mongoose.set('useFindAndModify', false);

const QuestionList = async (req, res, next) => {
  try {
    const { standard, difficulty, subject, status, userId, topics, page } =
      req.query;

    const currentPage = page ? parseInt(page, 10) : 1;
    const perPage = 15;
    const skip = (currentPage - 1) * perPage;

    const filters = {
      ...(standard ? { standard: { $regex: standard, $options: 'i' } } : {}),
      ...(difficulty
        ? { difficulty: { $regex: difficulty, $options: 'i' } }
        : {}),
      ...(subject ? { subject: { $regex: subject, $options: 'i' } } : {}),
      ...(status ? { status: { $regex: status, $options: 'i' } } : {}),
      ...(userId ? { userId } : {}),
      ...(topics && topics.length !== 0 ? { topic: { $in: [topics] } } : {}),
    };

    const questions = await Question.find(filters)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(perPage)
      .exec();

    const total = await Question.countDocuments(filters).exec();

    const data = {
      questions,
      meta: {
        total,
        currentPage: page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
    if (questions.length !== 0) {
      apiResponse.successResponseWithData(res, 'Success', data);
    } else {
      apiResponse.notFoundResponse(res, 'No data found');
    }
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

const AddQuestion = async (req, res, next) => {
  try {
    const {
      standard,
      topics,
      options,
      question,
      subject,
      difficulty,
      userId,
      answer,
      answerExplaination,
    } = req.body;
    console.log(req.body);
    const newItem = new Question({
      question,
      options,
      answer,
      standard,
      subject,
      topic: topics,
      // imageUrl,
      difficulty,
      userId,
      answerExplaination,
    });
    await newItem
      .save()
      .then(() => apiResponse.successResponse(res, 'Successfully added'))
      .catch((err) => {
        logger.error('Error :', err);
        return apiResponse.ErrorResponse(res, 'Error while adding Question');
      });
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

const UpdateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Question.findByIdAndUpdate(id, {
      status,
    })
      .then(() => apiResponse.successResponse(res, 'Question Status Updated'))
      .catch((err) => {
        logger.error('Error :', err);
        return apiResponse.ErrorResponse(res, 'Error while updating Question');
      });
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

const GeneratePDF = async (req, res, next) => {
  const { standard, subject, board, pdfData } = req.body;
  const fonts = {
    Roboto: {
      normal: 'fonts/Roboto/Roboto-Regular.ttf',
      bold: 'fonts/Roboto/Roboto-Medium.ttf',
      italics: 'fonts/Roboto/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto/Roboto-MediumItalic.ttf',
    },
  };
  // const dd = {
  //   content: [
  //     'First paragraph',
  //     'Another paragraph, this time a little bit longer to make sure,this line will ',
  //   ],
  // };
  const indexing = ['A', 'B', 'C', 'D'];
  const year = new Date().getFullYear();
  const dd = {
    content: [
      {
        alignment: 'center',
        text: `Question Paper (Term 1) ${year}-${year + 1}\n\n`,
        style: 'header',
      },
      {
        alignment: 'center',
        columns: [
          {
            text: `Class - ${standard}`,
          },
          {
            text: `Board - ${board}`,
          },
          {
            text: `Subject - ${subject}`,
          },
          {
            text: 'Time - 90mins',
          },
        ],
      },
      {
        stack: [
          {
            text: 'General Instructions',
          },
          '1. The Question Paper contains three sections',
          '2. The first section contains the general instructions',
          '3. The second section contains the questions',
          '4. The third section contains the answers',
          'All Questions carry equal marks',
          'There is no negative marking',
        ],
        style: 'superMargin',
        italics: true,
        margin: [0, 12, 2, 20],
      },
      pdfData.map((item, index) => ({
        stack: [
          {
            text: `Q${index + 1}. ${item.question}`,
            bold: true,
            margin: [0, 0, 0, 10],
          },
          item.options.map((option, i) => ({
            text: `${indexing[i]}. ${option}`,
            margin: [0, 0, 0, 10],
          })),
        ],
      })),
    ],
  };
  const pdfmake = new PdfMake(fonts);
  const doc = pdfmake.createPdfKitDocument(dd);
  doc.pipe(fs.createWriteStream('document.pdf'));
  doc.end();
  res.send(pdfData);
};

const SwitchQuestion = async (req, res, next) => {
  try {
    const { id } = req.query;
    const ans = await Question.findById(id);

    const items = await Question.find({
      standard: ans.standard,
      subject: { $regex: ans.subject, $options: 'i' },
      status: { $regex: 'approved', $options: 'i' },
      difficulty: { $regex: ans.difficulty, $options: 'i' },
      topic: { $in: ans.topic },
      _id: { $ne: new mongoose.Types.ObjectId(id) },
    })
      .limit(3)
      .exec();

    if (items.length === 0) {
      apiResponse.notFoundResponse(res, 'No data found');
    } else {
      const result = items[Math.floor(Math.random() * items.length)];
      await apiResponse.successResponseWithData(res, 'Success', result);
    }
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

const Stats = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const total = await Question.countDocuments();
    const approved = await Question.countDocuments({
      status: { $regex: 'approved', $options: 'i' },
      ...(userId ? { userId } : {}),
    });
    const pending = await Question.countDocuments({
      status: { $regex: 'pending', $options: 'i' },
      ...(userId ? { userId } : {}),
    });
    const rejected = await Question.countDocuments({
      status: { $regex: 'rejected', $options: 'i' },
      ...(userId ? { userId } : {}),
    });
    // number of question contributed per day
    const contribute = await Question.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date('2022-03-01T00:00:00.000Z'),
            $lt: new Date(),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalQuestion: { $sum: 1 },
        },
      },
    ]);
    // number of question contributed per month
    const month = await Question.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalQuestions: { $sum: 1 },
        },
      },
    ]);
    await apiResponse.successResponseWithData(res, 'Success', {
      total,
      approved,
      pending,
      rejected,
      contribute,
      month,
    });
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

const generatePaper = async (req, res, next) => {
  const query = [];
  const ans = [];
  let items = [];
  const {
    subject, standard, topicsDistribution,
  } = req.body;
  // eslint-disable-next-line prefer-const
  let { easy, medium, hard } = req.body;
  if (subject && subject != null) {
    query.push({
      $match: {
        subject: { $regex: subject, $options: 'i' },
        standard,
        status: { $regex: 'approved', $options: 'i' },
      },
    });
  }
  let totalQuestons = easy + medium + hard;
  const topicsPerQuestion = totalQuestons / topicsDistribution.length;
  topicsDistribution.forEach(async (topic) => {
    //  if(topic.cnt ==-1){
    // eslint-disable-next-line no-param-reassign
    topic.cnt = topicsPerQuestion;
    // }
  });

  topicsDistribution.forEach(async (topic) => {
    query.push({
      $match: {
        topic: { $in: topic.name },
      },
    });
    let limit = Math.floor(Math.random() * Math.min(topic.cnt + 1, easy + 1));
    query.push({
      $limit: limit,
      $match: {
        difficulty: { $regex: 'easy', $options: 'i' },
      },
    });
    console.log(query, 'easy');
    // items = await Question.aggregate(query);
    query.pop();
    // ans.push(items);
    // easy -= items.length();
    // // eslint-disable-next-line no-param-reassign
    // topic.cnt -= items.length();

    // for medium
    limit = Math.floor(Math.random() * Math.min(topic.cnt, medium));
    query.push({
      $limit: limit,
      $match: {
        difficulty: { $regex: 'medium', $options: 'i' },
      },
    });
    // items = await Question.aggregate(query);
    console.log(query, 'med');
    query.pop();
    // ans.push(items);
    // medium -= items.length();
    // // eslint-disable-next-line no-param-reassign
    // topic.cnt -= items.length();

    // for hard
    limit = Math.floor(Math.random() * Math.min(topic.cnt, hard));
    query.push({
      $limit: limit,
      $match: {
        difficulty: { $regex: 'hard', $options: 'i' },
      },
    });
    items = await Question.aggregate(query);
    console.log(query, 'hard');
    query.pop();
    ans.push(items);
    hard -= items.length();
    // eslint-disable-next-line no-param-reassign
    topic.cnt -= items.length();
    query.pop();
  });
  totalQuestons -= ans.length;
  if (totalQuestons > 0) {
    query.pop();
    query.pop();
    query.push({
      $limit: totalQuestons,
    });
    items = await Question.aggregate(query);
    ans.push(items);
  }
  res.send(ans);
};

module.exports = {
  QuestionList,
  AddQuestion,
  UpdateQuestion,
  // GeneratePaper,
  SwitchQuestion,
  Stats,
  GeneratePDF,
};
