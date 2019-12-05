const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const FollowerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    follower: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Follower', FollowerSchema)