const express = require('express');
const admin_router = express.Router();
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('../models/User');
const formidable = require('formidable');
const fs = require('fs');
const mongoose = require("mongoose");
const RouteBuilder = require("../routes/template_route");
const dataUser = require('../userFunctions/dataUser');
const Admin = require('../models/Admin');
const Session = require('../models/Session');
const writeToUser = require('../adminFunctions/writeToUser');
const base = require('../adminFunctions/base');
const systemModerator = require('../adminFunctions/systemModerator');
const roleValidator = require('../validators/roleValidator');
const dataOwner = require('../adminFunctions/dataOwner')
admin_router.use(cors());
dotenv.config();

admin_router.post('/login', (req, res) => {
    base.login(req.body['nickname'], req.body['password']).then(data =>
    {
        res.json(data);
    }).catch(err => {
        res.json(err);
    })
});

admin_router.post('/logout', (req, res) => {
    base.logOut(req.body['id']).then(data =>
    {
        res.json(data);
    }).catch(err => {
        res.json(err);
    })
});

admin_router.post('/systemModerator/RegisterAdmin', (req, res) => {
    let role = 'systemModerator';
    let idSession = req.body['idSession'];
    let roleForNewAdmin = req.body['role'];
    let nickname = req.body['nickname'];
    let password = req.body['password'];
    roleValidator(idSession, role).then(str => {
        return systemModerator.registerNewAdmin(nickname, roleForNewAdmin, password)
    })
    .then(data => {
        res.json({data: data});
    }).catch(err => {
        res.json({errors: err});
    });
});

admin_router.post('/systemModerator/BanUser', (req, res) => {
    let role = 'systemModerator';
    let idSession = req.body['idSession'];
    let idUser = req.body['user'];
    let message = req.body['message'];
    let timeTo = new Date(req.body['timeTo']);
    roleValidator(idSession, role).then(str => {
        return systemModerator.banUser(idUser, message, timeTo)
    }).then(data => {
        res.json({data: data});
    }).catch(err => {
        res.json({errors: err});
    });
});

admin_router.post('/systemModerator/DelAdmin', (req, res) => {
    let role = 'systemModerator';
    let idSession = req.body['idSession'];
    let idAdmin = req.body['admin'];
    roleValidator(idSession, role).then(str => {
        return systemModerator.delAdmin(idAdmin);
    }).then(data => {
        res.json({data: data});
    }).catch(err => {
        res.json({errors: err});
    });
});

admin_router.post('/systemModerator/Unlock', (req, res) => {
    let role = 'systemModerator';
    let idSession = req.body['idSession'];
    let idUser = req.body['user'];
    roleValidator(idSession, role).then(str => {
        return systemModerator.unlock(idUser)
    }).then(data => {
        res.json({data: data});
    }).catch(err => {
        res.json({errors: err});
    });
});

admin_router.post('/dataOwner/Backup', (req, res) => {
    let role = 'dataOwner';
    let idSession = req.body['idSession'];
    let path = req.body['path'];
    roleValidator(idSession, role).then(str => {
        return path? dataOwner.makeBackup(path) : dataOwner.makeBackup();
    }).then(saved => {
        res.json({data: saved});
    }).catch(err => {
        res.json({errors: err});
    })
});

admin_router.post('/writeToUser', (req, res) => {
    let idSession = req.body['idSession'];
    let message = req.body['message'];
    let idUser = req.body['user'];
    Session.findOne({_id: idSession}).then(session => {
       if (!session) {
           throw Error('Session not found');
       }
       return Admin.findOne({_id: session._id.toString()});
    }).then(admin => {
        if (!admin) {
            throw Error("Admin is not found");
        }
        return writeToUser(idUser, message,admin.nickname)
    }).then(sent => {
        res.json({data: sent});
    }).catch(err => {
        res.json({errors: err});
    });
});

module.exports = admin_router;