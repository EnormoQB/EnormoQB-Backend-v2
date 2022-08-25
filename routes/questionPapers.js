const express = require('express');
const QuestionPapersController = require('../controllers/QuestionPapersController');
const { parseReqForCsv } = require('../middlewares');

const router = express.Router();

router.post('/preview', QuestionPapersController.GeneratePreview);
router.post('/generatePaper', QuestionPapersController.GeneratePaperModel);
router.get('/previousyear', QuestionPapersController.PreviousYear);
router.get('/userpapers', QuestionPapersController.UserGeneratedPaper);
router.post('/parsecsv', parseReqForCsv, QuestionPapersController.ParseCsv);

module.exports = router;
