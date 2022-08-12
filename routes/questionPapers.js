const express = require('express');
const QuestionPapersController = require('../controllers/QuestionPapersController');

const router = express.Router();

router.post('/preview', QuestionPapersController.GeneratePreview);
router.post('/generatePaper', QuestionPapersController.CreateNewPaper);
// router.get('/generate', QuestionPapersController.GeneratePDF);

module.exports = router;
