const express = require('express');
const QuestionController = require('../controllers/QuestionController');
const { parseReqForImage } = require('../middlewares');

const router = express.Router();

router.get('/list', QuestionController.QuestionList);
router.post('/add', parseReqForImage, QuestionController.AddQuestion);
router.patch('/update/:id', QuestionController.UpdateQuestion);
router.get('/switch', QuestionController.SwitchQuestion);
router.get('/stats', QuestionController.Stats);

module.exports = router;
