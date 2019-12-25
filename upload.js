const multer = require('multer');
const Resize = require('./resize');
const path = require('path');
const fs = require('fs');
const upload = multer({
    limits: {
        fileSize: 4 * 1024 * 1024,
    }
});

async function saveImg(req, res) {
    if (!req.file) {
        res.json(req.mainData);
    }
    const imagePath = path.join(__dirname, '/public/images/' + req.folder);
    if (!fs.existsSync(imagePath)){
        fs.mkdirSync(imagePath, {recursive: true})
    }
    const fileUpload = new Resize(imagePath);
    await fs.writeFileSync(imagePath + "/" + req.mainData.data._id.toString() + '.png', req.file.buffer);
    const filename = await fileUpload.save(req.mainData.data._id.toString());
    res.json(req.mainData);
}

module.exports = {upload: upload, saveImg: saveImg};