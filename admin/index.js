const AdminBro = require('admin-bro');
const AdminBroExpress = require('admin-bro-expressjs');
AdminBro.registerAdapter(require('admin-bro-mongoose'));
const User = require('../models/UserModel');
const Question = require('../models/QuestionModel');
const QuestionPaper = require('../models/QuestionPaperModel');
const theme = require('./theme');

const initializeAdmin = (sessionConfig) => {
  const adminBro = new AdminBro({
    resources: [User, Question, QuestionPaper],
    rootPath: '/admin',
    loginPath: '/admin/login',
    logoutPath: '/admin/logout',
    branding: {
      companyName: 'EnormoQB',
      theme,
      softwareBrothers: false,
      logo: 'https://raw.githubusercontent.com/EnormoQB/EnormoQB-Client/ef2ae67a3d0d63039370549ca9047684c8613c1f/src/assets/Logo.svg',
    },
  });

  const ADMIN = {
    email: process.env.ADMIN_EMAIL || 'enormoqb@gmail.com',
    password: process.env.ADMIN_PASSWORD,
  };

  const adminBroRouter = AdminBroExpress.buildAuthenticatedRouter(
    adminBro,
    {
      cookieName: process.env.ADMIN_COOKIE_NAME || 'admin-bro',
      cookiePassword:
        process.env.ADMIN_COOKIE_PASS ||
        'bro-this-coookie-is-too-long-for-you-to-crack',
      authenticate: async (email, password) => {
        if (email === ADMIN.email && password === ADMIN.password) {
          return ADMIN;
        }

        return null;
      },
    },
    undefined,
    sessionConfig,
  );

  return adminBroRouter;
};

module.exports = initializeAdmin;
