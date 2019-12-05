const Admin = require('./../models/Admin');
const Session = require('./../models/Session');
const User = require('./../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const validator = require('./../validators/passwordValidator');

function login(nickname, password) {
    return new Promise((resolve, reject) => {
        Admin.findOne({nickname: nickname}).then(admin => {
            if (!admin) {
                reject({errors: 'admin is not exist'});
            }
            if (validator(password, admin.password)) {
                let token = jwt.sign({_id: admin._id.toString(), nickname: admin.nickname},
                    process.env.SECRET_KEY, {
                        expiresIn: 1440
                    });
                Session.create({user: admin._id.toString()}).then(sessionResult => {
                    let obj = {data: {_id: sessionResult._id.toString(), token: token}};
                    resolve(obj);
                })
            } else {
                reject({errors: "incorrect password"});
            }
        })
    })
}

function logOut(id) {
    return new Promise((resolve, reject) => {
        Session.deleteOne({_id: id}, (err, result) => {
            if (err) {
                console.log(err)
            }
            res.json({errors: err, data: "you are logged out"});
        })
    })
}

module.exports = {logOut: logOut, login: login};