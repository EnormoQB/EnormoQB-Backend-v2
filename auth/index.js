const passport = require('passport');
const express = require('express');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const apiResponse = require('../helpers/apiResponse');
const User = require('../models/UserModel');
const PendingInvites = require('../models/PendingInvites');
const logger = require('../helpers/winston');
const Question = require('../models/QuestionModel');

const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: `${process.env.BASE_PATH}auth/google/callback`,
    },
    (_, __, profile, cb) => {
      try {
        User.findOne({ googleId: profile.id }, async (err, doc) => {
          if (err) {
            return cb(err, null);
          }

          if (!doc) {
            const email =
              profile.emails && profile.emails[0].value
                ? profile.emails[0].value
                : '';
            const invite = await PendingInvites.findOne({
              email,
            }).exec();

            const userType = invite ? invite.role : 'contributor';
            const typeLastChanged = Date.now();

            const newUser = new User({
              googleId: profile.id,
              username: profile.displayName || '',
              email: (profile.emails && profile.emails[0].value
                ? profile.emails[0].value
                : ''
              ).toLowerCase(),
              userType,
              typeLastChanged,
              privileges: [],
              image:
                profile.photos && profile.photos[0].value
                  ? profile.photos[0].value
                  : '',
              questions: [],
              questionPaper: [],
              points: 0,
            });

            if (invite) {
              PendingInvites.deleteOne(
                {
                  email,
                },
                () => {
                  logger.debug(`Deleted Invitation for ${email}`);
                },
              );
            }

            await newUser.save();
            cb(null, newUser);
          } else {
            cb(null, doc);
          }
        });
      } catch (error) {
        logger.error('Error :', error);
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

router.post('/toggleStatus', async (req, res, next) => {
  try {
    const { userId, quesId } = req.body;
    const userDetails = await User.findById(userId);

    if (userDetails.status.value === 'freezed') {
      userDetails.status = { ...userDetails.status, value: 'active' };
      userDetails.save();
    } else {
      const freezedDetails = {
        lastFreezed: new Date(),
        count: userDetails.status.freezedDetails.count + 1,
      };
      userDetails.status = {
        ...userDetails.status,
        value: 'freezed',
        freezedDetails,
      };
      userDetails.save();
    }

    await Question.findByIdAndUpdate(quesId, {
      status: 'rejected',
      feedback: 'Reported',
    });

    apiResponse.successResponse(res, 'Successful');
  } catch (error) {
    logger.error('Error :', error);
    apiResponse.ErrorResponse(res, error);
    next(error);
  }
});

router.get('/logout', (req, res) => {
  if (req.user) {
    req.logout();
    res.send('done');
  }
});

module.exports = router;
