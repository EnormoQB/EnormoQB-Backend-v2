const express = require('express');
const QuestionsRouter = require('./questions');
const QuestionPapersRouter = require('./questionPapers');
const AssetsRouter = require('./assets');
const SubjectRouter = require('./subject');
const MailRouter = require('./mail');

const { checkAuthentication } = require('../middlewares');

const app = express();

app.use('/questions/', checkAuthentication, QuestionsRouter);
app.use('/questionPapers/', checkAuthentication, QuestionPapersRouter);
app.use('/assets/', AssetsRouter);
app.use('/subjectsData/', SubjectRouter);
app.use('/mail/', checkAuthentication, MailRouter);

module.exports = app;
