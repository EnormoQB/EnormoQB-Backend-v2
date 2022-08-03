const mongoose = require('mongoose');
// const apiResponse = require('../helpers/apiResponse');
const Question = require('../models/QuestionModel');

const helperFn = async (topic, query, type, ans, tough) => {
  const limit = Math.floor(Math.random() * Math.min(topic.queNum + 1, type + 1));
  query.push({
    $limit: limit,
    $match: {
      difficulty: { $regex: `${tough}`, $options: 'i' },
    },
  });
  console.log(query, `${tough}`);
  const items = await Question.aggregate(query);
  ans.push(items);
  // eslint-disable-next-line no-param-reassign
  topic.queNum -= items.length();
  return items.length();
};
const GeneratePaper = async (req, res, next) => {
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
    //  if(topic.queNum ==-1){
    // eslint-disable-next-line no-param-reassign
    topic.queNum = topicsPerQuestion;
    // }
  });
  topicsDistribution.forEach(async (topic) => {
    query.push({
      $match: {
        topic: { $in: topic.name },
      },
    });
    easy -= helperFn(topic, query, easy, ans, 'easy');
    query.pop();
    medium -= helperFn(topic, query, medium, ans, 'medium');
    query.pop();
    hard -= helperFn(topic, query, hard, ans, 'hard');
    query.pop();
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
  GeneratePaper,

};
