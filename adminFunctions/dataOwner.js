const dotenv = require('dotenv');
dotenv.config();
const Admin = require('../models/Admin');
const uri = process.env.mongoURI;
const path = process.env.STORAGE_ROOT;
const base = require('./base');
const backup = require('mongodb-backup');
const db = require('mongoose');
const fs = require('fs');

function makeBackup(pathData=path) {

    return new Promise(async (resolve, reject) => {

        let time = new Date();
        pathData += `/${time.getDate()}_${time.getMonth() + 1}_${time.getFullYear()}__${time.getHours()}_${time.getMinutes()}`;

        await fs.mkdirSync(pathData, {recursive: true});

        for (let key in db.models) {
            let collection = db.models[key];
            fs.mkdirSync(`${pathData}/${key}`, {recursive: true});
            let result = await collection.find().exec();
            fs.writeFile(`${pathData}/${key}/data.json`,
                JSON.stringify(result),
                function (err) {if (err)  reject(err);}
                )

        }
        resolve('saved to ' + pathData);
    })
}

module.exports = {
    makeBackup: makeBackup
};
