const bcrypt = require('bcrypt');

module.exports = function(val, hash) {
        return bcrypt.compareSync(val, hash);
    };
