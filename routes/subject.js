const express = require('express');
const apiResponse = require('../helpers/apiResponse');
const logger = require('../helpers/winston');
const subjects = require('../helpers/subjectsData');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    await apiResponse.successResponseWithData(res, 'Success', subjects);
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
});

module.exports = router;
