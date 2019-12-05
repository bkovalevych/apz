const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Message = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    role: String,
    type: String,
    answered: String,
    text: String,
    files: [String]
});

module.exports = mongoose.model('Message', Message);
