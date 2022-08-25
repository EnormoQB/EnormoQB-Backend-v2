const express = require('express');
const QuestionController = require('../controllers/QuestionController');
<<<<<<< HEAD
const { parseReqForImage, rateLimiter } = require('../middlewares');

const router = express.Router();

router.get('/reserved', QuestionController.ReservedQuestions);
router.get('/list', QuestionController.QuestionList);
router.get('/perTopic', QuestionController.QuestionsPerTopic);
router.post(
  '/add',
  rateLimiter,
  parseReqForImage,
  QuestionController.AddQuestion,
);
router.patch('/update/:id', QuestionController.UpdateStatus);
router.get('/switch', QuestionController.SwitchQuestion);
router.get('/stats', QuestionController.Stats);
router.delete('/delete/:id', QuestionController.DeleteQuestion);
router.get('/userIdUpdate/', QuestionController.userIdUpdate);
=======
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
>>>>>>> 351378e7ee1ee798ffe0be58b7c0468fe91ef071

module.exports = router;
