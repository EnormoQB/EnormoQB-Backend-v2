const express = require('express');
const QuestionsRouter = require('./questions');
const AssetsRouter = require('./assets');

const { checkAuthentication } = require('../middlewares');

const app = express();

// app.use('/questions/', checkAuthentication, QuestionsRouter);
app.use('/questions/', QuestionsRouter);
app.use('/assets/', AssetsRouter);

module.exports = app;
