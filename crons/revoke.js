const cron = require('node-cron');
const User = require('../models/UserModel');

// runs everyday at 12:00 AM
cron.schedule('0 0 0 * * *', async () => {
  const users = (await User.find()).filter((user) => {
    if (user.userType !== 'exam-setter') return false;
    return new Date() - new Date(user.typeLastChanged) >= 3.6e3 * 48; // greater than 48 hrs
  });

  users.forEach((user) => {
    User.findByIdAndUpdate(user._id, {
      typeLastChanged: new Date(),
      userType: 'reviewer',
    }).exec();
  });
});
