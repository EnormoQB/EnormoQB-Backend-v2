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
    await query.push({
      $match: {
        subject: { $regex: req.query.subject, $options: 'i' },
        standard: req.query.standard,
        status: { $regex: 'approved', $options: 'i' },
        difficulty: { $regex: 'easy', $options: 'i' },
      },
    });
  }

  // await query.push({
  //   $match: {
  //     difficulty: { $regex: 'easy', $options: 'i' },
  //   },
  // });
  let items = await Question.aggregate(query);
  const ans = [];

  for (let i = 0; i < req.query.easy; i += 1) {
    const random = Math.floor(Math.random() * items.length);
    ans.push(items[random]);
    items.splice(random, 1);
  }

  await query.pop();
  await query.push({
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
  await query.pop();
  await query.push({
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
  // res.send(ans);
  const fonts = {
    Roboto: {
      normal: 'fonts/Roboto/Roboto-Regular.ttf',
      bold: 'fonts/Roboto/Roboto-Medium.ttf',
      italics: 'fonts/Roboto/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto/Roboto-MediumItalic.ttf',
    },
  };
  const dd = {
    content: [
      {
        text: 'This is a header, using header style',
        style: 'header',
      },
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam.\n\n',
      {
        text: 'Subheader 1 - using subheader style',
        style: 'subheader',
      },
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.\n\n',
      {
        text: 'Subheader 2 - using subheader style',
        style: 'subheader',
      },
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.\n\n',
      {
        text: 'It is possible to apply multiple styles, by passing an array. This paragraph uses two styles: quote and small. When multiple styles are provided, they are evaluated in the specified order which is important in case they define the same properties',
        style: ['quote', 'small'],
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
      },
      subheader: {
        fontSize: 15,
        bold: true,
      },
      quote: {
        italics: true,
      },
      small: {
        fontSize: 8,
      },
    },
  };
  const pdfmake = new PdfMake(fonts);
  const doc = pdfmake.createPdfKitDocument(dd);
  doc.pipe(fs.createWriteStream('document.pdf'));
  doc.end();
  res.send(ans);
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

  if (items.length === 1) {
    res.send(ans);
  } else {
    let result;
    do {
      result = items[Math.floor(Math.random() * items.length)];
    // eslint-disable-next-line eqeqeq
    } while (result._id == id);
    await res.send(result);
  }
};
module.exports = {
  Test, QuestionList, AddQuestion, UpdateQuestion, GeneratePaper, SwitchQuestion,
};
