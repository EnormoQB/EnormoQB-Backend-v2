const multer = require('multer');

const checkAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect(process.env.CLIENT_URL);
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
module.exports = { checkAuthentication, parseReqForImage };
