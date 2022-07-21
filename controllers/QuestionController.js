const mongoose = require('mongoose');
const PdfMake = require('pdfmake');
const fs = require('fs');
const apiResponse = require('../helpers/apiResponse');
const Question = require('../models/QuestionModel');
// const User = require('../models/UserModel');

mongoose.set('useFindAndModify', false);

const Test = (req, res, next) => {};

const QuestionList = async (req, res, next) => {
  const query = [];
  // Sort
  query.push({
    $sort: { updatedAt: -1 },
  });
  // Filter according to standard
  if (req.query.standard && req.query.standard != null) {
    query.push({
      $match: {
        standard: req.query.standard,
      },
    });
  }
  // Filter according to difficulty
  if (req.query.difficulty && req.query.difficulty != null) {
    query.push({
      $match: {
        difficulty: { $regex: req.query.difficulty, $options: 'i' },
      },
    });
  }
  // Filter according to subject
  if (req.query.subject && req.query.subject != null) {
    query.push({
      $match: {
        subject: { $regex: req.query.subject, $options: 'i' },
      },
    });
  }
  // Filter according to status
  if (req.query.status && req.query.status != null) {
    query.push({
      $match: {
        status: { $regex: req.query.status, $options: 'i' },
      },
    });
  }
  // Filter according to userId
  if (req.query.userId && req.query.userId != null) {
    query.push({
      $match: {
        userId: { $regex: req.query.userId, $options: 'i' },
      },
    });
  }
  // Filter according to topics
  if (req.query.topics && req.query.topics != null) {
    query.push({
      $match: {
        topic: { $in: [req.query.topics] },
      },
    });
  }
  // Pagination
  const total = (await Question.aggregate(query)).length;
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const perPage = 15;
  const skip = (page - 1) * perPage;
  query.push({
    $skip: skip,
  });
  query.push({
    $limit: perPage,
  });
  const items = await Question.aggregate(query);
  const data = {
    items,
    meta: {
      total,
      currentPage: page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
  if (items.length !== 0) {
    apiResponse.successResponseWithData(res, 'Success', data);
  } else {
    apiResponse.ErrorResponse(res, 'No data found');
  }
};

const AddQuestion = async (req, res, next) => {
  const {
    standard,
    topic,
    imageUrl,
    answer,
    options,
    question,
    subject,
    difficulty,
    userId,
  } = req.body;
  const newItem = new Question({
    question,
    options,
    answer,
    standard,
    subject,
    topic,
    imageUrl,
    difficulty,
    userId,
  });
  await newItem
    .save()
    .then(() => apiResponse.successResponse(res, 'Successfully added'))
    .catch((err) => {
      console.log(err);
      return apiResponse.ErrorResponse(res, 'Error while adding Question');
    });
};

const UpdateQuestion = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  await Question.findByIdAndUpdate(id, {
    status,
  })
    .then(() => apiResponse.successResponse(res, 'Question Status Updated'))
    .catch((err) => {
      console.log(err);
      return apiResponse.ErrorResponse(res, 'Error while updating Question');
    });
};

const GeneratePaper = async (req, res, next) => {
  const query = [];

  if (req.query.subject && req.query.subject != null) {
    query.push({
      $match: {
        subject: { $regex: req.query.subject, $options: 'i' },
        standard: req.query.standard,
        status: { $regex: 'approved', $options: 'i' },
        difficulty: { $regex: 'easy', $options: 'i' },
      },
    });
  }
  let items = await Question.aggregate(query);
  const ans = [];

  for (let i = 0; i < req.query.easy; i += 1) {
    const random = Math.floor(Math.random() * items.length);
    ans.push(items[random]);
    items.splice(random, 1);
  }

  query.pop();
  query.push({
    $match: {
      difficulty: { $regex: 'medium', $options: 'i' },
    },
  });

  items = await Question.aggregate(query);

  for (let i = 0; i < req.query.medium; i += 1) {
    const random = Math.floor(Math.random() * items.length);
    ans.push(items[random]);
    items.splice(random, 1);
  }
  query.pop();
  query.push({
    $match: {
      difficulty: { $regex: 'hard', $options: 'i' },
    },
  });

  items = await Question.aggregate(query);

  for (let i = 0; i < req.query.hard; i += 1) {
    const random = Math.floor(Math.random() * items.length);
    ans.push(items[random]);
    items.splice(random, 1);
  }
  res.send(ans);
};

const GeneratePDF = async (req, res, next) => {
  const {
    standard, subject, board, pdfData,
  } = req.body;
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
  const { id } = req.query;
  const ans = await Question.findById(id);
  const query = [];
  await query.push({
    $match: {
      standard: ans.standard,
      subject: { $regex: ans.subject, $options: 'i' },
      status: { $regex: 'approved', $options: 'i' },
      difficulty: { $regex: ans.difficulty, $options: 'i' },
      topic: { $in: ans.topic },
    },
  });

  const items = await Question.aggregate(query);
  if (items.length === 0) {
    apiResponse.ErrorResponse(res, 'No data found');
  }

  if (items.length === 1) {
    res.send(ans);
  } else {
    let result;
    do {
      result = items[Math.floor(Math.random() * items.length)];
    // eslint-disable-next-line eqeqeq
    } while (result._id == id);
    await apiResponse.successResponseWithData(res, 'Success', result);
  }
};

const Stats = async (req, res, next) => {
  console.log(req.query);
  const total = await Question.countDocuments();
  const approved = await Question.countDocuments({ status: 'approved', userId: req.query.userId });
  const pending = await Question.countDocuments({ status: 'pending', userId: req.query.userId });
  const rejected = await Question.countDocuments({ status: 'rejected', userId: req.query.userId });
  // number of question contributed per day
  const contribute = await Question.aggregate([
    {
      $match: { createdAt: { $gte: new Date('2022-03-01T00:00:00.000Z'), $lt: new Date('2022-08-01T00:00:00.000Z') } },
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
    total, approved, pending, rejected, contribute, month,
  });
};

module.exports = {
  Test,
  QuestionList,
  AddQuestion,
  UpdateQuestion,
  GeneratePaper,
  SwitchQuestion,
  Stats,
  GeneratePDF,
};
