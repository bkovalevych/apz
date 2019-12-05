const mongoose = require('mongoose');
const {Int32} = require("mongodb");
const Schema = mongoose.Schema;

// Create Schema
const MoveBaseSchema = new Schema({
    sensorName: {
        type: String,
        required: true
    },
    muscleName: {
        type: String,
        required: true,
    },
    metaInfo: ({
        electrodesNumber: Schema.Types.Number,
        frequency: Schema.Types.Number,
        imageSrc: String
    }),

});

module.exports = MoveBase = mongoose.model('MoveBase', MoveBaseSchema)
