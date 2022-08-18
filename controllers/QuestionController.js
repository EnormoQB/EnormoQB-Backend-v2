const mongoose = require('mongoose');
const fetch = require('node-fetch');
const apiResponse = require('../helpers/apiResponse');
const Question = require('../models/QuestionModel');
const logger = require('../helpers/winston');
const { uploadFileToS3, downloadFromS3 } = require('../helpers/awsUtils');
const User = require('../models/UserModel');
const reservedQuestions = require('../helpers/reservedQuestion');

mongoose.set('useFindAndModify', false);

const ReservedQuestions = async (req, res, next) => {
  try {
    await apiResponse.successResponseWithData(
      res,
      'Success',
      reservedQuestions,
    );
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
      .populate('similarQuestions')
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

    if (
      standard.length < 1 ||
      answer.length < 1 ||
      subject.length < 1 ||
      topics.length < 1
    ) {
      return apiResponse.validationErrorWithData(
        res,
        'Please send all the required fields',
      );
    }

    const questionId = new mongoose.Types.ObjectId();
    let imageKey = null;

    if (req.file) {
      await uploadFileToS3(
        req.file.buffer,
        questionId.toString(),
        req.file.mimetype,
      );
      imageKey = questionId.toString();
    }

    const filters = {
      ...(standard ? { standard: { $regex: standard, $options: 'i' } } : {}),
      ...(subject ? { subject: { $regex: subject, $options: 'i' } } : {}),
      ...(topics && topics.length !== 0 ? { topic: { $in: [topics] } } : {}),
      status: { $in: ['pending', 'approved'] },
    };

    const questions = await Question.find(filters).exec();

    const response = await fetch(process.env.SIMILARITY_API, {
      method: 'POST',
      body: JSON.stringify({ questions, target: question }),
      headers: { 'Content-Type': 'application/json' },
    });

    const similarQuestionsResponse = JSON.parse(await response.text());

    const similarQuestionsID = similarQuestionsResponse.map((item) => item._id);

    const newQuestion = new Question({
      _id: questionId,
      question,
      options,
      answer,
      standard,
      subject,
      topic: topics,
      status: 'pending',
      imageKey,
      difficulty,
      userId,
      answerExplaination,
      similarQuestions: similarQuestionsID,
    });

    await newQuestion
      .save()
      .then(() => {
        similarQuestionsResponse.forEach((item) => {
          const { similarQuestions = [] } = item;
          similarQuestions.push(questionId);
          item.similarQuestions = similarQuestions;
          Question.findByIdAndUpdate(item._id, item).exec();
        });
        apiResponse.successResponse(res, 'Successfully added');
      })
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

const UpdateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (status === 'approved') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });
    }
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
    // const { userId } = req.query;
    const { id } = req.user._id;
    const total = await Question.countDocuments({
      ...(req.user.userType === 'member' || req.userType === 'developer' ? { id } : {}),
    });
    const approved = await Question.countDocuments({
      status: { $regex: 'approved', $options: 'i' },
      ...(req.user.userType === 'member' || req.userType === 'developer' ? { id } : {}),
    });
    const pending = await Question.countDocuments({
      status: { $regex: 'pending', $options: 'i' },
      ...(req.user.userType === 'member' || req.userType === 'developer' ? { id } : {}),
    });
    const rejected = await Question.countDocuments({
      status: { $regex: 'rejected', $options: 'i' },
      ...(req.user.userType === 'member' || req.userType === 'developer' ? { id } : {}),
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

const UpdateFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    await Question.findByIdAndUpdate(id, { feedback, status: 'rejected' })
      .then(() => apiResponse.successResponse(res, 'Question feedback Updated'))
      .catch((err) => {
        logger.error('Error :', err);
        return apiResponse.ErrorResponse(res, 'Error while updating Question');
      });
  } catch (err) {
    logger.error('Error :', err);
    return apiResponse.ErrorResponse(res, 'Error while updating Feedback');
  }
};

module.exports = {
  QuestionList,
  AddQuestion,
  UpdateStatus,
  ReservedQuestions,
  SwitchQuestion,
  Stats,
  UpdateFeedback,
};
