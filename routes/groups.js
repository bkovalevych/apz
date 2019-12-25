const express = require('express');
const groups_router = express.Router();
const cors = require('cors');
const funcGroup = require('../groupFunctions/base');
const GroupM = require('../models/GroupMedia');
groups_router.use(cors());
const Builder = require('./template_route');
let template = new Builder(GroupM, "GroupsMedia");
let provider = require('../validators/userProvider');


//'/groups/'
groups_router.post('/create', (req, res) => {
    let idSession = req.body['idSession'];
    let name = req.body['name'];
    let mode = req.body['mode'];
    let members = req.body['members'];
    let description = req.body['description'];
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
        funcGroup.createGroup(id, name, mode, members, description);
    }).catch(err => {
        res.json({errors: err});
    })

});

groups_router.post("/switchOwner", (req, res) => {
    let o = req.body;
    let groupId = o.groupId;
    let member = o.member;
    let val = o.val;
    funcGroup.switchOwner(groupId, member, val).then(data => res.json(data)).catch(err => res.json(err));
});

groups_router.delete('/delete', (req, res) => {

});

groups_router.post('/members', (req, res) => {
    let members = req.body['members'];
    let groupId = req.body['groupId'];
    funcGroup.addMembers(members, groupId).then(data=> {
        res.json({data: data});
    }).catch(err => {
        res.json({errors: err});
    })
});

groups_router.get('/members/:id', (req, res) => {
    let id = req.params.id;
    funcGroup.getMembers(id).then(data => {
        res.json(data);
    }).catch(err => {
        res.json(err);
    })
});

groups_router.delete('/members', (req, res) => {
    let members = req.body['members'];
    let groupId = req.body['groupId'];
    funcGroup.deleteMembers(members, groupId).then(data=> {
        res.json({data: data});
    }).catch(err => {
        res.json({errors: err});
    })
});

groups_router.post('/', (req, res) => {
    template.showAll(req, res);
});



module.exports = groups_router;