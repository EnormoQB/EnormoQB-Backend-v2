const multer = require('multer');
const { RateLimiter } = require('limiter');
const apiResponse = require('../helpers/apiResponse');

const limiter = new RateLimiter({
  tokensPerInterval: 300,
  interval: 'hour',
  fireImmediately: true,
});

const checkAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    apiResponse.unauthorizedResponse(res, 'Unauthorized Request');
  }
};

const parseReqForImage = (req, res, next) => {
  const multerUpload = multer({
    limits: { fileSize: 10000000 },
  });
  const multerFn = multerUpload.single('image');
  multerFn(req, res, (err) => {
    if (err instanceof multer) {
      res.status(500).send({
        status: 500,
        message: err.message,
      });
    } else {
      next(err);
    }
  });
};

const rateLimiter = async (req, res, next) => {
  const remainingRequests = await limiter.removeTokens(1);
  if (remainingRequests < 0) {
    apiResponse.rateLimiterResponse(
      res,
      'Too Many Requests - your IP is being rate limited',
    );
  } else {
    next();
  }
};

const parseReqForCsv = (req, res, next) => {
  const multerUpload = multer({
    limits: { fileSize: 100000 },
  });

  const multerFn = multerUpload.single('csvFile');
  multerFn(req, res, (err) => {
    if (err instanceof multer) {
      res.status(500).send({
        status: 500,
        message: err.message,
      });
    } else {
      next(err);
    }
  });
};

module.exports = {
  checkAuthentication,
  parseReqForImage,
  rateLimiter,
  parseReqForCsv,
};
