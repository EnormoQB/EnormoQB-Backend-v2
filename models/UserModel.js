const mongoose = require('mongoose');

const UserScehema = new mongoose.Schema(
  {
    username: { required: true, type: String },
    email: { required: true, type: String },
    googleId: { required: true, type: String },
    userType: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {
        role: 'contributor',
        lastChanged: Date.now,
        spanHours: '48',
      },
    },
    image: { required: true, type: String },
    questions: { type: mongoose.Schema.Types.Array, required: false },
    questionPaper: { type: mongoose.Schema.Types.Array, required: false },
    points: { type: Number, required: true, default: 0 },
    history: { type: mongoose.Schema.Types.Array, required: false },
    status: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {
        value: 'active',
        freezedDetails: {
          lastFreezed: null,
          count: 0,
        },
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', UserScehema);
