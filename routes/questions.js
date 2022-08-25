const express = require('express');
const QuestionController = require('../controllers/QuestionController');
const { parseReqForImage, checkAuthentication } = require('../middlewares');

const router = express.Router();

router.get(
  '/reserved',
  checkAuthentication,
  QuestionController.ReservedQuestions,
);
router.get('/list', checkAuthentication, QuestionController.QuestionList);
router.get(
  '/perTopic',
  checkAuthentication,
  QuestionController.QuestionsPerTopic,
);
router.post('/add', parseReqForImage, QuestionController.AddQuestion);
router.patch(
  '/update/:id',
  checkAuthentication,
  QuestionController.UpdateStatus,
);
router.get('/switch', checkAuthentication, QuestionController.SwitchQuestion);
router.get('/stats', checkAuthentication, QuestionController.Stats);
router.delete(
  '/delete/:id',
  checkAuthentication,
  QuestionController.DeleteQuestion,
);

module.exports = router;
