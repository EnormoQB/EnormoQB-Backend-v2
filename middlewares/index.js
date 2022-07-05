const checkAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect(process.env.CLIENT_URL);
  }
};

module.exports = { checkAuthentication };
