
const path = require('path');
const gm = require('gm');
const fs = require('fs');
class Resize {
    constructor(folder) {
        this.folder = folder;
    }
    async save(filename) {
        const filepath = this.filepath(filename);


// resize and remove EXIF profile data
        await gm(filepath)
            .resize(300, 300)
            .noProfile()
            .write(filepath, function (err) {
                if (!err) console.log('done');
            });

        return filename;
    }
    filepath(filename) {
        return path.resolve(`${this.folder}/${filename}.png`)
    }
}
module.exports = Resize;