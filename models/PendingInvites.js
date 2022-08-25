const mongoose = require('mongoose');

const PendingInviteScehema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    role: {
      required: true,
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Pending Invites', PendingInviteScehema);
