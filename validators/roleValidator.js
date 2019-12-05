const Admin = require('../models/Admin');
const Session = require('../models/Session');

module.exports = function (idSession, role) {
  return new Promise((resolve, reject) => {
      Session.findOne({_id: idSession}).then(session => {
          if (!session) {
              reject('Session not found')
          }
          return Admin.findOne( {_id: session.user});
      }).then (admin => {
          if (!admin) {
              reject('admin not found');
          }
          if (admin.role !== role) {
              reject('permission denied');
          }
          resolve('access');
      }).catch(err => {
          reject(err);
      })
  })
};