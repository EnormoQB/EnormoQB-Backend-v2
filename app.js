const express = require('express');
require('dotenv').config();
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const authRouter = require('./auth');
const initializeAdmin = require('./admin');
const apiResponse = require('./helpers/apiResponse');

const app = express();

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    replicaSet: 'rs0',
  })
  .then(() => {
    console.log('Connected to MongoDB');
  });

const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: 'sessions',
});

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }),
);

app.set('trust proxy', 1);

const sessionConfig =
  process.env.NODE_ENV === 'development'
    ? {
      secret: process.env.SECRET,
      resave: true,
      saveUninitialized: true,
      store,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // One Week
      },
    }
    : {
      secret: process.env.SECRET,
      resave: true,
      saveUninitialized: true,
      store,
      cookie: {
        sameSite: 'none',
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // One Week
      },
    };

app.use(session(sessionConfig));

app.use(express.static('public'));

app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));

const { adminBro, adminBroRouter } = initializeAdmin(sessionConfig);
app.use(adminBro.options.rootPath, adminBroRouter);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Route Prefixes
app.use('/', indexRouter);
app.use('auth/', authRouter);
app.use('api/', apiRouter);

// throw 404 if URL not found
app.all('*', (req, res) => apiResponse.notFoundResponse(res, 'Page not found'));

app.use((err, req, res) => {
  if (err.name === 'UnauthorizedError') {
    return apiResponse.unauthorizedResponse(res, err.message);
  }
});

module.exports = app;
