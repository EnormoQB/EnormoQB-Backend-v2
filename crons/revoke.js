const cron = require('node-cron');
const User = require('../models/UserModel');

// every minute
cron.schedule('* * * * * *', async () => {
  const users = await User.find({});

  //   users.map((user) => {});
});
