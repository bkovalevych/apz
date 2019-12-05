const express = require('express');
const move_base_router = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');
const MoveBase = require('../models/MoveBase');
const Admin = require('../models/Admin');
const Session = require('../models/Session')
const formidable = require('formidable');
const fs = require('fs');
const mongoose = require("mongoose");
const userFunctions = require("../routes/Users");
const TemplateRoute = require("../routes/template_route")

move_base_router.use(cors());
dotenv.config();

let routeBuilder = new TemplateRoute(MoveBase, "MoveBase", (idSession) => {
    return new Promise((resolve, reject) => {
        let role = 'moveBaseAdmin';
        Session.findOne({_id: idSession}).then(result => {
            if (!result) {
                reject("Session not found");
            }
            return Admin.findOne({_id: result.user.toString()})
        }).then(admin => {
            if (!admin) {
                reject('Admin not found');
            }
            if (admin.role !== role) {
                reject('Permission denied');
            }
            resolve(admin._id.toString());
        })
    })
});

move_base_router.post('/add', (req, res) => {
    routeBuilder.add(req, res);
});
/*
move_base_router.post('/add', (req, res) => {
    let data = {
        muscleName: "arm wrist biceps",
        sensorName: "arm1",
        metaInfo: {
            electrodesNumber: 4,
            frequency: 500,
            imageSrc: "shared/img2321"
        }
    };
    MoveBase.create(data).then((result) => {
        console.log(result);
        res.json(result);
    }).catch(err => {throw err;})
});
*/
move_base_router.post('/', (req, res)=> {
    routeBuilder.showAll(req, res, MoveBase, "moveBase")
});
/*
move_base_router.post('/', (req, res) => {
    let limit = 100;
    let skip = 0;
    let sortParameter = 'muscleName';
    let sortObj = {};
    let reverse = 1;
    sortObj[sortParameter] = reverse
    MoveBase.find().sort(sortObj).skip(skip).limit(limit)
        .then(result => {
            res.json(result)
        })
        .catch(err => console.log(err));
});
*/
move_base_router.delete('/delete', (req, res) => {
    routeBuilder.delete(req, res);
});

move_base_router.put('/update', (req, res) => {
    routeBuilder.update(req, res);
});

module.exports = move_base_router;