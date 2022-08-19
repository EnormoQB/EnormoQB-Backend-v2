const express = require('express');
const MailController = require('../controllers/MailController');

const router = express.Router();

router.get('/request', MailController.RequestContributions);

module.exports = router;
