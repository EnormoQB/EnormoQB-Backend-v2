const express = require('express');
const QuestionsRouter = require('./questions');
const { checkAuthentication } = require('../middlewares');

const app = express();

app.use('/questions/', checkAuthentication, QuestionsRouter);

module.exports = app;
