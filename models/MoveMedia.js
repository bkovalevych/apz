const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const MoveMediaSchema = new Schema({

    author: {type: Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now},
    description: Schema.Types.String,
    duration: Schema.Types.Number,
    uses_count: {type: Schema.Types.Number, default: 0},
    name: {type: Schema.Types.String, unique: true},
    mode: Schema.Types.String,
    data: [{moduleName: String, buf: Schema.Types.Buffer}],
    meta_info: Schema.Types.String
});

module.exports = MoveMedia = mongoose.model('MoveMedia', MoveMediaSchema)
