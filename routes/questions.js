const express = require('express');
const QuestionController = require('../controllers/QuestionController');

const router = express.Router();

router.post('/test', QuestionController.Test);

module.exports = router;
