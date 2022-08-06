/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
// const apiResponse = require('../helpers/apiResponse');
const Question = require('../models/QuestionModel');

const helperFn = async (topic, type, ans, tough, filter, idList, limit = 0) => {
  limit = limit === 0 ? (Math.floor(Math.random() * Math.min(topic.cnt + 1, type + 1))) : limit;
  if (limit <= 0) {
    return 0;
  }
  filter.difficulty = { $regex: `${tough}`, $options: 'i' };
  const items = await Question.find(filter).limit(limit);
  items.map((item) => {
    ans.push(item);
    return idList.push(item._id);
  });
  return items.length;
};

const GeneratePaper = async (req, res, next) => {
  const ans = [];
  const idList = [];
  let len = 0;
  let totalTopicQues = 0;
  let topicCovered = 0;
  const {
    subject, standard, topicsDistribution,
  } = req.body;
  let { easy, medium, hard } = req.body;
  const filter = {
    ...(standard ? { standard: { $regex: standard, $options: 'i' } } : {}),
    ...(subject ? { subject: { $regex: subject, $options: 'i' } } : {}),
    status: { $regex: 'accepted', $options: 'i' },
  };
  topicsDistribution.forEach(async (topic) => {
    if (topic.cnt !== -1) {
      totalTopicQues += topic.cnt;
      topicCovered += 1;
    }
  });
  console.log(totalTopicQues);
  let totalQuestions = easy + medium + hard;
  let questionleft = totalQuestions;
  questionleft -= totalTopicQues;
  console.log(totalQuestions);
  const topicsPerQuestion = Math.floor(questionleft / (topicsDistribution.length - topicCovered));

  topicsDistribution.forEach(async (topic) => {
    if (topic.cnt === -1) {
      topic.cnt = topicsPerQuestion;
    }
  });
  console.log(topicsDistribution);
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
        len = await helperFn(topic, hard, ans, 'hard', filter, idList, topic.cnt);
        hard -= len;
        topic.cnt -= len;
      }
      console.log(topic.name, topic.cnt, easy, medium, hard);
      y += 1;
    }
  }
  totalQuestions -= ans.length;
  if (totalQuestions > 0) {
    filter._id = { $nin: idList };
    filter.topic = { $in: topicsDistribution.map((topic) => topic.name) };
    filter.difficulty = { $in: ['Easy', 'Medium', 'Hard'] };
    const items = await Question.find(filter).limit(totalQuestions);
    items.map((item) => ans.push(item));
  }
  res.send(ans);
};

module.exports = {
  GeneratePaper,

};
