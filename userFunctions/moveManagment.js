const Session = require('../models/Session');
const User = require('../models/User');
const Admin = require('../models/Admin');
const MoveMedia = require('../models/MoveMedia');
const axios = require('axios');
const provider = require('../validators/userProvider');
const myPort = require('../serial/base');


function play(idSession, idMedia) {
    return new Promise((resolve, reject) => {
        let userId = null;
        let isAdmin = false;
        provider(idSession).then(user => {
            if (user === 'Admin') {
                isAdmin = true;
            } else {
                userId = user;
            }
            return MoveMedia.findOne({_id: idMedia});
        }).then(media => {
            if (!media) {
                reject('Media not found');
            }
            if (isAdmin || media.mode === 'private' &&
                media.author.toString() !== userId) {
                reject('Permission denied');
            }
            let obj = {duration: media.duration, data: []};
            for (let key in media.data) {
                let flow = media.data[key];
                obj.data.push({moduleName: flow.moduleName, duf: flow.buf})
            }
            myPort.write(media.data, (err) => {
                if (err) {
                    reject(err.toString());
                }
                resolve("ok");
            })
        }).catch(err => {
            console.log(err);
            reject(err.toString());
        })
    })
}

function record(idSession ,idMedia, obj) {
    return new Promise((resolve, reject) => {
        let userId = null;
        let isAdmin = false;
        provider(idSession).then(user => {
            if (user === 'Admin') {
                isAdmin = true;
            } else {
                userId = user;
            }
            if (typeof obj === typeof 'str') {
                obj = JSON.parse(obj);
            }
            return MoveMedia.updateOne({_id: idMedia}, {"$set": {duration: obj.duration, data: obj.data}});
        })
       .then((saved) => {
            resolve(saved);
        }).catch(err => {
            console.log(err);
            reject(err);
        })
    });
}

module.exports = {record: record, play: play};