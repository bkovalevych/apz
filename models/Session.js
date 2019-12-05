const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Session = new Schema({
    user: {type: Schema.Types.ObjectId},
    data: [{key: String, value: String}]
});

module.exports = mongoose.model('Session', Session);
