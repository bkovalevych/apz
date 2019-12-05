const Admin = require('./../models/Admin');
const User = require('./../models/User');
const bcrypt = require('bcrypt');

function registerNewAdmin(nickname, role, password) {
    return new Promise((resolve, reject) =>
        {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    reject(err);
                }
                Admin.create({nickname: nickname, password: hash, role: role}).
                then(data => resolve(data)).catch(err => reject(err));
            })
        }
    )
}

function delAdmin(_id) {
    return new Promise((resolve, reject) => {
        Admin.deleteOne({_id: _id}).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        })
    })
}

function banUser(user_id, message, timeTo) {
    return new Promise((resolve, reject) => {
        User.findOne({_id: user_id}).then((user) => {
            user.banMessage = message;
            user.unlockTime = timeTo;
            return user.save();
        }).then(() => {
            resolve(`${user_id} banned`)
        }).catch(err => {
            reject(err);
        })
    })
}

function unlock(user_id) {
    return new Promise((resolve, reject) => {
        User.findOne({_id: user_id}).then(user => {
            user.banMessage = null;
            user.unlockTime = null;
            return user.save();
        }).then(() => {
            resolve(`${user_id} unlocked`);
        }).catch(err => {
            reject(err);
        })
    })
}

module.exports = {banUser: banUser, delAdmin: delAdmin, registerNewAdmin: registerNewAdmin, unlock: unlock};