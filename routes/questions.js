const express = require('express');
const QuestionController = require('../controllers/QuestionController');

const router = express.Router();

router.post('/test', QuestionController.Test);
router.get('/list', QuestionController.QuestionList);
router.post('/add', QuestionController.AddQuestion);
router.patch('/update/:id', QuestionController.UpdateQuestion);
router.get('/generate', QuestionController.GeneratePaper);
router.get('/switch', QuestionController.SwitchQuestion);
router.get('/stats', QuestionController.Stats);

module.exports = router;
