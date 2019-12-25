const express = require('express');
const follower_router = express.Router();
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('../models/User');
const Follower = require('../models/Follower')
const formidable = require('formidable');
const fs = require('fs');
const mongoose = require("mongoose");
const RouteBuilder = require("../routes/template_route");
const dataUser = require('../userFunctions/dataUser');

follower_router.use(cors());
dotenv.config();

follower_router.post('/follow', (req, res) => {
    let userId = null;
    let fields = req.body;
    dataUser(fields["idSession"]).then(sessionVal => {
        if (!sessionVal) {
            res.json({errors: "Session not found"})
        }
        userId = sessionVal.user.toString();
        if (typeof fields.object === typeof  ' sd'){
            fields.object = JSON.parse(fields.object);
        }
        fields.object.follower = userId;
        if (userId === fields.object.user) {
            throw Error('You cant subscribe yourself')
        }
        return Follower.findOne({user: fields.object.user, follower: fields.object.follower})
    }).
    then(mustBeNull => {
        if(mustBeNull) {
            throw Error("You are already subscribed");
        }
        return User.find({'$or': [{'_id': fields.object.user}, {'_id': fields.object.follower}]})
    }).
    then(twoUsers => {
        if(twoUsers[0]._id.toString() === fields.object.user) {
            twoUsers[0].followersNumber += 1;
            twoUsers[1].subscribesNumber += 1;
        } else {
            twoUsers[1].followersNumber += 1;
            twoUsers[0].subscribesNumber += 1;
        }
        return Promise.all([twoUsers[0].save(), twoUsers[1].save(), Follower.create(fields.object)])
    }).
    then(results => {
        res.json({"errors": null, data: "You are subscribed"});
    }).
    catch(err => {
        console.log({errors: err})
    })

});

function unlinkOrUnsubscribe(req, res, parameter) {
    let userId = null;
    let fields = req.body;
    dataUser(fields["idSession"]).then(sessionVal => {
        userId = sessionVal.user.toString();
        if (typeof fields.object === typeof ' sd') {
            fields.object = JSON.parse(fields.object);
        }
        let searchData = [];
        for (let str of fields.object) {
            let obj = {};
            obj[parameter] = str;
            searchData.push(obj)
        }
        return Promise.all([
            User.findOne({'_id': userId}),
            Follower.find({"$or": searchData}).remove(),
            User.findOne({'_id': fields.object[0]})
        ]);
    }).
    then(values => {
        let subOrLink = (parameter === 'user')? "subscribesNumber" : "followersNumber";
        let rev = (parameter !== 'user')? "subscribesNumber" : "followersNumber";
        values[0][subOrLink] -= fields.object.length;
        values[2][rev] -= fields.object.length;
        return Promise.all([values[0].save(),values[2].save()]);
    }).
    then(result => {
        res.json({errors: null, data: "done"});
    }).
    catch(err => {
        res.json({errors: err});

    })

}

follower_router.post('/unsubscribe', (req, res) => {
    unlinkOrUnsubscribe(req, res, 'user');
});

follower_router.post('/deleteFollower', (req, res) => {
    unlinkOrUnsubscribe(req, res, 'follower');
});

follower_router.post('/getSubscribes', (req, res) => {
    Follower.find({follower: req.body['id']}).then(result => {
        res.json({data: result});
    }).catch(err => {res.json({errors: err})});
});

follower_router.post('/getFollowers', (req, res) => {
    Follower.find({user: req.body['id']}).then(result => {
        res.json({data: result});
    }).catch(err => {res.json({errors: err})});
});

module.exports = follower_router;