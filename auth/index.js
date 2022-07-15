const passport = require('passport');
const express = require('express');

const router = express.Router();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/UserModel');

// subject to change, User model and login strategy both
passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: '/auth/google/callback',
    },
    (profile, cb) => {
      try {
        User.findOne({ googleId: profile.id }, async (err, doc) => {
          if (err) {
            return cb(err, null);
          }

          if (!doc) {
            const newUser = new User({
              googleId: profile.id,
              username: profile.displayName || '',
              email: (profile.emails && profile.emails[0].value
                ? profile.emails[0].value
                : ''
              ).toLowerCase(),
              userType: 'member',
              privileges: [],
              image:
                profile.photos && profile.photos[0].value
                  ? profile.photos[0].value
                  : '',
            });

            await newUser.save();
            cb(null, newUser);
          }
          cb(null, doc);
        });
      } catch (e) {
        console.log(e);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser((id, done) => {
  User.findById(id, (err, doc) => done(null, doc));
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.CLIENT_URL,
    session: true,
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  },
);

router.get('/user', (req, res) => {
  res.send(req.user);
});

router.get('/logout', (req, res) => {
  if (req.user) {
    req.logout();
    res.send('done');
  }
});

module.exports = router;
