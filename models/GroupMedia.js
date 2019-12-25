const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const GroupMediaSchema = new Schema({
    creator: {type: Schema.Types.ObjectId, ref: 'User'},
    mode: String,
    name: {type: String, unique: true},
    description: String,
    date: {type: Date, default: Date.now},
    modules: [{type: Schema.Types.ObjectId, ref: 'MoveBase'}],
    usersNumber: {type: Schema.Types.Number, default: 0},
    currentSender: Schema.Types.ObjectId,
    currentMove: [{
        time: {type: Date, default: Date.now},
        models: [{
            name: String,
            buf: Schema.Types.Buffer
        }]
    }]
});

module.exports = GroupMedia = mongoose.model('GroupMedia', GroupMediaSchema);
