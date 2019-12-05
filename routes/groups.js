const express = require('express');
const groups_router = express.Router();
const cors = require('cors');
const funcGroup = require('../groupFunctions/base');
const GroupM = require('../models/GroupMedia');
groups_router.use(cors());
const Builder = require('./template_route');
let template = new Builder(GroupM, "GroupsMedia");
let provider = require('../validators/userProvider');

groups_router.post('/create', (req, res) => {
    let idSession = req.body['idSession'];
    let name = req.body['name'];
    let mode = req.body['mode'];
    let members = req.body['members'];
    if (!members) {
        members = [];
    }
    if (typeof members === typeof "string") {
        members = JSON.parse(members);
    }
    provider(idSession).then(id => {
        if (id === "Admin") {
            res.json({errors: "Admin cant create group"});
        }
        funcGroup.createGroup(id, name, mode, members);
    }).catch(err => {
        res.json({errors: err});
    })

});

groups_router.delete('/delete', (req, res) => {});

groups_router.post('/members', (req, res) => {});

groups_router.delete('/members', (req, res) => {});

groups_router.post('/', (req, res) => {
    template.showAll(req, res);
});

groups_router.post('getMembersByGroupId', (req, res) => {

});

module.exports = groups_router;