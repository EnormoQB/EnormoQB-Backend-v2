const AdminBro = require('admin-bro');
const AdminBroExpress = require('admin-bro-expressjs');
AdminBro.registerAdapter(require('admin-bro-mongoose'));
const User = require('../models/UserModel');
const Question = require('../models/QuestionModel');
const QuestionPaper = require('../models/QuestionPaperModel');
const PendingInvites = require('../models/PendingInvites');
const theme = require('./theme');

const initializeAdmin = (sessionConfig) => {
  const adminBro = new AdminBro({
    resources: [User, Question, QuestionPaper, PendingInvites],
    rootPath: `${process.env.ADMIN_ROOT_PATH}admin`,
    loginPath: `${process.env.ADMIN_ROOT_PATH}admin/login`,
    logoutPath: `${process.env.ADMIN_ROOT_PATH}admin/logout`,
    branding: {
      companyName: 'EnormoQB',
      theme,
      softwareBrothers: false,
      logo: `${process.env.ADMIN_ROOT_PATH}logo.svg`,
    },
    pages: {
      'Create Admin': {
        label: 'Create Admin',
        component: AdminBro.bundle('./createAdminPage'),
      },
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
