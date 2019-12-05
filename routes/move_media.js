const express = require('express');
const mediaRouter = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');
const MoveMedia = require('../models/MoveMedia');
const formidable = require('formidable');
const fs = require('fs');
const mongoose = require("mongoose");
const Session = require('../models/Session');
const RouteBuilder = require("../routes/template_route");
const moveManagment = require("../userFunctions/moveManagment");


mediaRouter.use(cors());
dotenv.config();
let routeBuilder = new RouteBuilder(MoveMedia, "MoveMedia");
/*
* MF-1: Профіль користувача.
* MF-2: Збереження нейронних імпульсів як дані про рух з додатковими назвою, описом або застереженням.
* MF-3: Відтворення рухів.
* MF-4: Виявлення патологій або захворювань, пов’язаних з нервовою системою.
* MF-5: Створення груп користувачів для взаємодії у реальному часі.
* MF-6: Відображення даних рухів за різними фільтрами (автор, час, популярність на основі користування, за групою м’язів).
* MF-8: Реалізація різних видів доступу для даних про рух (приватний, публічний, лише для тих, хто підписався).
*/


mediaRouter.post('/add', (req, res) => {
    routeBuilder.add(req, res, (fields) => {
       fields.object.author = routeBuilder.author
    });
});

//mediaRouter.put('/')

mediaRouter.post('/', (req, res) => {
    //userFunctions.checkUser(req.body);
    routeBuilder.showAll(req, res);
});

mediaRouter.put('/update', (req, res) => {
   routeBuilder.update(req, res);
});

mediaRouter.put('/record', (req, res) => {
    let idSession = req.body['idSession'];
    let idMedia = req.body['idMedia'];
    let obj = req.body['object'];
    moveManagment.record(idSession, idMedia, obj).then(result => {
        res.json({data: result});
    }).catch(err => {
        res.json({errors: err});
    })
});

mediaRouter.post('/play', (req, res) => {
    let idSession = req.body['idSession'];
    let idMedia = req.body['idMedia'];
    let path = req.body[''];
    moveManagment.play(idSession, idMedia, path);
});

mediaRouter.delete('/delete', (req, res) => {
    routeBuilder.delete(req, res);
});


mediaRouter.post('/play', (req, res) => {

});



// MF-3: Відтворення рухів.
module.exports = mediaRouter;