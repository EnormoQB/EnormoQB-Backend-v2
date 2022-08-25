require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const logger = require('./winston');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const main = async (mailOptions) => {
  await sgMail
    .sendMultiple(mailOptions)
    .then((response) => {
      logger.info('Email sent successfully', response);
    })
    .catch((error) => {
      logger.error('Error', error);
    });
};

module.exports = main;
