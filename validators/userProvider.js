const Session = require('../models/Session');
const User = require('../models/User');
const Admin = require('../models/Admin');

module.exports = (idSession) => {
    return new Promise((resolve, reject) => {
        let userId = null;
        Session.findOne({_id: idSession}).then (session => {
            if (!session) {
                reject("Session not found");
            }
            return Promise.all([
                User.findOne({_id: session.user.toString()}),
                Admin.findOne({_id: session.user.toString()})
            ])
        }).then(values => {
            if (values[1]) {
                resolve("Admin");
            }
            if (values[0]) {
                resolve(values[0]._id.toString());
            }
            reject("User not found")
        })
    })
};