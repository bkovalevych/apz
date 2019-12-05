const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({

  nickname: {
    type: String,
    required: [true, 'Your nickname can not be blank']
  },
  email: {
    type: String,
    required: [true, 'Your email cannot be blank']
  },
  password: {
    type: String,
    required: [true, 'Your password cannot be blank']
  },
  unlockTime: Date,
  banMessage: String,

  active: {
    type: Boolean,
    required: true,
    default: false,
  },
  messages: [{
    admin: String,
    text: String,
    files: [String],
    time: {type: Date, default: Date.now}
  }],
  followersNumber: {
    type: Schema.Types.Number,
    default: 0
  },
  subscribesNumber: {
    type: Schema.Types.Number,
    default: 0
  },
  activationToken: String
});

module.exports = User = mongoose.model('User', UserSchema);
