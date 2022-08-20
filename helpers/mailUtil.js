const nodemailer = require('nodemailer');
const logger = require('./winston');
require('dotenv').config();

const main = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.ADMIN_EMAIL,
      pass: process.env.SMTP_PASSWORD,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });

  const info = await transporter.sendMail(mailOptions);

  logger.info('Email sent successfully', info.messageId);
};

module.exports = main;
