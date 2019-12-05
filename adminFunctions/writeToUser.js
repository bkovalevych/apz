const User = require('./../models/User');

module.exports = writeToUser;
function writeToUser(user_id, message, adminName, files) {
    return new Promise((resolve, reject) => {
        User.findOne({_id: user_id}).then(user => {
            if (!user) {
                reject('Not found user')
            }
            user.messages.push({admin: adminName, text: message, files: files});
            return user.save();
        }).then(() => {
            resolve("message was sent");
        }).catch(err => {
            reject(err);
        })
    })
}
