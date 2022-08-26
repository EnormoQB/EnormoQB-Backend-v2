const express = require('express');
const QuestionPapersController = require('../controllers/QuestionPapersController');

const router = express.Router();

router.post('/preview', QuestionPapersController.GeneratePreview);
router.post('/convert', QuestionPapersController.languageConverter);
router.post('/generatePaper', QuestionPapersController.GeneratePaperModel);
router.get('/previousyear', QuestionPapersController.PreviousYear);
router.get('/userpapers', QuestionPapersController.UserGeneratedPaper);

module.exports = router;
