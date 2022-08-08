const apiResponse = require('../helpers/apiResponse');
const Question = require('../models/QuestionModel');
const logger = require('../helpers/winston');

const helperFn = async (topic, type, ans, tough, filter, idList, limit = 0) => {
  limit =
    limit === 0
      ? Math.floor(Math.random() * Math.min(topic.cnt + 1, type + 1))
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

const GeneratePaper = async (req, res, next) => {
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
      if (topic.cnt !== -1) {
        totalTopicQues += topic.cnt;
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
      if (topic.cnt === -1) {
        topic.cnt = topicsPerQuestion;
      }
    });

    for (let i = 0; i < topicsDistribution.length; i += 1) {
      const topic = topicsDistribution[i];
      let y = 0;
      filter.topic = { $in: topic.name };
      while (topic.cnt > 0 && y < 3) {
        if (topic.cnt > 0 && easy > 0) {
          len = await helperFn(topic, easy, ans, 'easy', filter, idList);
          easy -= len;
          topic.cnt -= len;
        }
        if (topic.cnt > 0 && medium > 0) {
          len = await helperFn(topic, medium, ans, 'medium', filter, idList);
          medium -= len;
          topic.cnt -= len;
        }
        if (topic.cnt > 0 && hard > 0) {
          len = await helperFn(
            topic,
            hard,
            ans,
            'hard',
            filter,
            idList,
            topic.cnt,
          );
          hard -= len;
          topic.cnt -= len;
        }
        y += 1;
      }
    }

    // console.log(
    //   idList.length,
    //   idList.filter((v, i, a) => a.indexOf(v) === i).length,
    // );

    totalQuestions -= ans.length;
    if (totalQuestions > 0) {
      filter.topic = { $in: topicsDistribution.map((topic) => topic.name) };
      filter.difficulty = { $in: ['Easy', 'Medium', 'Hard'] };
      const items = await Question.find(filter).limit(totalQuestions);
      items.map((item) => ans.push(item));
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

module.exports = {
  GeneratePaper,
};
