const formidable = require('formidable');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const dataUser = require('../userFunctions/dataUser');


class TemplateRoute {
    init(idSession) {
        return new Promise((resolve, reject) => {
            let parent = this;
            if (this.author == null) {
                dataUser(idSession)
                    .then(result => {
                        parent.author = result['user'].toString();
                        resolve(parent.author);
                    })
                    .catch(err => { reject(err)});
            } else {
                resolve(parent.author)
            }
        })
    }

    constructor(collection, nameCollection, initFunc = null) {
        this.collection = collection;
        this.name = nameCollection;
        this.author = null;
        this.projectPath = process.env.STORAGE_ROOT;
        if (initFunc) {
            this.init = initFunc;
        }
    }
    /*
    * input: req: {
    *     limit: count of limit objects
    *     skip: count of skip
    *     sortParameter: {
    *         [{
    *              parameter: isReverse
    *         }]
    *     }
    *     output: [object]
    * }
    * */
    showAll(req, res) {
        let fields = req.body;
        let limit = fields.limit || 100;
        let skip = fields.skip || 0;
        let sortParameter = fields.sortParameter || {};
        let filter = fields.filter || {};
        this.collection.find(filter).sort(sortParameter).skip(skip).limit(limit).
        then(result => {
            res.json({data: result});
        }).
        catch(err => {
            console.log(`${this.name} error in showAll.formParse.collection.find\n message:`, err)
            res.json({errors: err})
        })

    }

     /*
     * input: req {
     *      files: [file], (names should be unique for type by author)
     *      fields: {object: {...}} (object to add)
     *   }
     * output: id
     **/

     add(req, res, next) {
        let tempRoute = this;
        let fields = req.body;


        tempRoute.init(fields['idSession']).
        then(returnedValue => {
            tempRoute.author = returnedValue;
            if (req.otherOperation != null) {
                req.otherOperation(fields)
            }
            return tempRoute.collection.create(fields)
        }).then(result => {
            req.folder = tempRoute.name;
            req.mainData = {data: result};
            next();
        }).catch(err => {
            console.log({errors: err, message: `Collection ${tempRoute.name}, trouble with adding`});
            res.json({errors: err, message: `Collection ${tempRoute.name}, trouble with adding`});
        });
     }



     /*
     * input: req {
     *      files: [file], (names should be the same for type by author to change)
     *      fields: {
     *          object: {...} (object to change)
     *          objectId: String (_id)
     *      }
     *   }
     * output: object
     **/
    update(req, res) {
        let tempRoute = this;
        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            tempRoute.init(fields['idSession']).then(returnedValue => {
                tempRoute.author = returnedValue;
                for (let fileKey in files) {
                    let oldPath = files[fileKey].path;
                    let name = files[fileKey].name;
                    let newPath = `${tempRoute.projectPath}/${tempRoute.author}/${fileKey}`;
                    tempRoute._readAndAppend(oldPath, newPath, name);
                }
                if (typeof fields.object === typeof "str") {
                    fields.object = JSON.parse(fields.object);
                }
                let objFind = {_id: fields.objectId};
                let newValue = {$set: fields.object};
                tempRoute.collection.updateOne(objFind, newValue, (error, result) => {
                    if (err) {
                        console.log({errors: err, message: `Collection ${tempRoute.name}, trouble with adding`})
                        res.json({errors: err, message: `Collection ${tempRoute.name}, trouble with adding`})
                    }
                    res.json({errors: null, data: result});
                })
            });

        })
    }

    /*
    * input: fields: {
    *     objectId: String
    * }
    *
    * output: String (deleted)
    **/
    delete(req, res) {
        let tempRoute = this;
        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            let findObject = {id: fields.objectId};
            tempRoute.init(fields['idSession']).then(returnedValue => {
                tempRoute.author = returnedValue;
                tempRoute.collection.findOne(findObject).then(result => {
                    tempRoute._deleteAllFilesOfNote(result.pathFiles);
                    tempRoute.collection.deleteOne(findObject)
                        .then(resultDel => {
                            res.json({errors: null, data: `object was deleted from ${tempRoute.name}`})
                        })
                        .catch(err => {
                            console.log(err);
                            res.json({errors: err});
                        })
                }).catch(err => {
                    console.log(err);
                })

            });

        })
    }



    _deleteAllFilesOfNote(pathFiles) {
        for (let key in pathFiles) {
            let path = pathFiles[key];
            fs.unlink(path, err => {
                if (err) {
                    console.log(err);
                }
            })
        }
    }

    _readAndAppend(pathFrom, pathTo, name) {
        fs.readFile(pathFrom, function (err, data) {
            if (err) throw err;
            try {
                if (!fs.existsSync(pathTo)){
                    fs.mkdirSync(pathTo, {recursive: true})
                }
            } catch (err) {
                throw err
            }
            fs.writeFile(`${pathTo}/${name}`, data, function (err) {
                if (err) throw err;
                console.log(`Data from ${pathFrom} was saved to ${pathTo}`);
            })
        })
    }
}

module.exports = TemplateRoute;