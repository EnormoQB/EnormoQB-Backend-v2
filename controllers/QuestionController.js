const mongoose = require('mongoose');
const PdfMake = require('pdfmake');
const fs = require('fs');
const imageDataURI = require('image-data-uri');
const apiResponse = require('../helpers/apiResponse');
const Question = require('../models/QuestionModel');
const logger = require('../helpers/winston');
const { uploadFileToS3, downloadFromS3 } = require('../helpers/awsUtils');
const QuestionPaper = require('../models/QuestionPaperModel');
const reservedQuestions = require('../helpers/reservedQuestion');
// const User = require('../models/UserModel');

mongoose.set('useFindAndModify', false);

const ReservedQuestions = async (req, res, next) => {
  try {
    await apiResponse.successResponseWithData(res, 'Success', reservedQuestions);
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};
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
      apiResponse.successResponseWithData(res, 'No data found', []);
    }
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
};

const AddQuestion = async (req, res, next) => {
  console.log(req.body);
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
    } = JSON.parse(req.body.data);

    const questionId = new mongoose.Types.ObjectId();

    await uploadFileToS3(
      req.file.buffer,
      questionId.toString(),
      req.file.mimetype,
    );

    const newQuestion = new Question({
      _id: questionId,
      question,
      options,
      answer,
      standard,
      subject,
      topic: topics,
      imageKey: questionId.toString(),
      difficulty,
      userId,
      answerExplaination,
    });
    await newQuestion
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
    await Question.findByIdAndUpdate(id, { status })
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
  const {
    standard,
    subject,
    pdfData,
    time,
    instructions,
    instituteName,
    name,
    quesDiffDetails,
  } = req.body;
  // const { id } = req.body;
  // const paperData = await QuestionPaper.findById(id);
  // eslint-disable-next-line max-len
  // const { questionList: pdfData, standard, subject, board, instituteName, examType, instructions, time, quesDiffDetails } = paperData;
  const fonts = {
    Roboto: {
      normal: 'fonts/Roboto/Roboto-Regular.ttf',
      bold: 'fonts/Roboto/Roboto-Medium.ttf',
      italics: 'fonts/Roboto/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto/Roboto-MediumItalic.ttf',
    },
  };
  // iterate over objects of objects quesDiffDetails to calculate marks
  let totalMarks = 0;
  Object.keys(quesDiffDetails).forEach((key) => {
    totalMarks += quesDiffDetails[key].marks * quesDiffDetails[key].count;
  });
  const indexing = ['A', 'B', 'C', 'D'];
  const year = new Date().getFullYear();
  const newPdfData = await Promise.all(
    pdfData.map(async (item) => {
      if (item.imageKey !== null) {
        const imageurl = downloadFromS3(item.imageKey);
        const final = await imageDataURI.encodeFromURL(imageurl);
        return { ...item, imageUrl: final };
      }
      return item;
    }),
  );

  const dd = {
    background(currentPage, pageSize) {
      return [
        {
          canvas: [
            { type: 'line', x1: 5, y1: 5, x2: 590, y2: 5, lineWidth: 2 }, // Up line
            { type: 'line', x1: 5, y1: 5, x2: 5, y2: 835, lineWidth: 2 }, // Left line
            { type: 'line', x1: 5, y1: 835, x2: 590, y2: 835, lineWidth: 2 }, // Bottom line
            { type: 'line', x1: 590, y1: 5, x2: 590, y2: 835, lineWidth: 2 }, // Rigth line
          ],
        },
      ];
    },
    content: [
      {
        alignment: 'center',
        text: `${instituteName.toUpperCase()}\n\n`,
        style: 'header',
        bold: true,
        fontSize: 20,
        margin: [0, 0, 0, -16],
      },
      {
        alignment: 'center',
        text: `Question Paper ${year}-${year + 1}\n\n`,
        style: 'header',
        bold: true,
        margin: [0, 0, 0, -10],
      },
      {
        alignment: 'center',
        style: 'header',
        bold: true,
        text: `Subject: ${subject.toUpperCase()}\n\n`,
        margin: [0, 0, 0, -10],
      },
      {
        alignment: 'center',
        style: 'header',
        bold: true,
        text: `Class - ${standard === '10' ? 'X' : 'XII'}`,
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            text: `Time - ${time}mins`,
          },
          {
            text: `Maximum Marks : ${totalMarks}`,
            alignment: 'right',
          },
        ],
        margin: [10, 0, 10, 6],
        bold: true,
      },
      {
        stack: [
          {
            text: 'General Instructions',
          },
          `${instructions}`,
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
      newPdfData.map((item, index) => ({
        stack: [
          {
            text: `Q${index + 1}. ${item.question}`,
            bold: true,
            margin: [0, 0, 0, 7],
          },
          item.imageKey !== null
            ? {
              image: item.imageUrl,
              width: 200,
              height: 100,
              margin: [0, 4, 0, 12],
              alignment: 'center',
            }
            : ' ',
          item.options.map((option, i) => ({
            text: `${indexing[i]}. ${option}`,
            margin: [0, 0, 0, 5],
          })),
          {
            text: ' ',
            margin: [0, 0, 0, 7],
          },
        ],
      })),
    ],
  };
  const answerkey = {
    background(currentPage, pageSize) {
      return [
        {
          canvas: [
            { type: 'line', x1: 5, y1: 5, x2: 590, y2: 5, lineWidth: 2 }, // Up line
            { type: 'line', x1: 5, y1: 5, x2: 5, y2: 835, lineWidth: 2 }, // Left line
            { type: 'line', x1: 5, y1: 835, x2: 590, y2: 835, lineWidth: 2 }, // Bottom line
            { type: 'line', x1: 590, y1: 5, x2: 590, y2: 835, lineWidth: 2 }, // Rigth line
          ],
        },
      ];
    },
    content: [
      {
        alignment: 'center',
        style: 'header',
        bold: true,
        text: `${name}`,
        margin: [0, 0, 0, 6],
        fontSize: 15,
      },
      {
        alignment: 'center',
        style: 'header',
        bold: true,
        text: 'Answer Key',
        margin: [0, 0, 0, 15],
      },
      newPdfData.map((item, index) => ({
        text: `${index + 1}. ${item.answer}`,
        margin: [0, 0, 0, 4],
      })),
    ],
  };
  const pdfmake = new PdfMake(fonts);
  const doc = pdfmake.createPdfKitDocument(dd);
  doc.pipe(fs.createWriteStream('document.pdf'));
  doc.end();
  const answerPdf = pdfmake.createPdfKitDocument(answerkey);
  answerPdf.pipe(fs.createWriteStream('answerkey.pdf'));
  answerPdf.end();
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
  const { subject, standard, topicsDistribution } = req.body;
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
  ReservedQuestions,
  SwitchQuestion,
  Stats,
  GeneratePDF,
};
