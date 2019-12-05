const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const AdminSchema = new Schema({
    nickname: {type:String, unique: true, required: [true, 'nickname is required']},
    password: String,
    role: String,

});

module.exports = Admin = mongoose.model('Admin', AdminSchema);
