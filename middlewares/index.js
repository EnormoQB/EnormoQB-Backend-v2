const multer = require('multer');
const csvParser = require('csv-parser');
const streamifier = require('streamifier');
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

const ParseCsv = async (req, res, next) => {
  try {
    let results = [];
    streamifier
      .createReadStream(req.file.buffer)
      .pipe(
        csvParser({
          headers: false,
        }),
      )
      .on('data', (data) => results.push(data))
      .on('end', () => {
        try {
          if (Array.isArray(results)) {
            results = results.map((resultItem) => ({
              ...resultItem,
              0: resultItem[0].trim(),
            }));
          }
        } catch (e) {
          console.error(e);
        }

        apiResponse.successResponseWithData(res, 'Parsing Successful', results);
      })
      .on('error', () => {
        apiResponse.ErrorResponse(res, 'Error occured while parsing csv');
      });
  } catch (e) {
    next(e);
  }
};

module.exports = { checkAuthentication, parseReqForImage, rateLimiter };
