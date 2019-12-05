const Session = require('../models/Session');
module.exports = (objectId) => {
    return Session.findOne({_id: objectId})
};