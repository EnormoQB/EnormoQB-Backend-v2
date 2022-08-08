const express = require('express');
const { downloadFromS3 } = require('../helpers/awsUtils');
const apiResponse = require('../helpers/apiResponse');
const logger = require('../helpers/winston');

const router = express.Router();

router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const url = downloadFromS3(id);
    res.redirect(url);
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
});

module.exports = router;
