const nodemailer = require('nodemailer');
require('dotenv').config();

const main = async () => {
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

  const mailOptions = {
    from: '"EnormoQB" <enormoqb@gmail.com>', // sender address
    to: 'apoorvd14@gmail.com, ankitoct01@gmail.com', // list of receivers comma separated
    subject: 'Nodemailer Testing', // Subject line
    html: '<p>Nodemailer is up!😎</p>', // html body
  };

  const info = await transporter.sendMail(mailOptions);

  console.log('Email sent successfully', info.messageId);
};

main().catch(console.error);
