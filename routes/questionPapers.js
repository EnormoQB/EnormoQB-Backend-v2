const express = require('express');
const QuestionPapersController = require('../controllers/QuestionPapersController');

const router = express.Router();

router.post('/preview', QuestionPapersController.GeneratePreview);
router.post('/generatePaper', QuestionPapersController.GeneratePaperModel, QuestionPapersController.CreateNewPaper);
router.get('/previousyear', QuestionPapersController.PreviousYear);

module.exports = router;
