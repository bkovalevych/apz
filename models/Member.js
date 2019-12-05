const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const MemberSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    Role: {type: String, default: 'Listener'},
    groupId: {type: Schema.Types.ObjectId, ref: 'GroupMedia'}
});

module.exports = Member = mongoose.model('Member', MemberSchema);
