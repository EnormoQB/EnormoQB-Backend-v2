const express = require('express');
const QuestionsRouter = require('./questions');
const QuestionPapersRouter = require('./questionPapers');
const AssetsRouter = require('./assets');
const SubjectRouter = require('./subject');

const { checkAuthentication } = require('../middlewares');

const app = express();

// app.use('/questions/', checkAuthentication, QuestionsRouter);
app.use('/questions/', QuestionsRouter);
app.use('/questionPapers/', QuestionPapersRouter);
app.use('/assets/', AssetsRouter);
app.use('/subjectsData/', SubjectRouter);

module.exports = app;
