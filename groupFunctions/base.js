const GroupMedia = require('../models/GroupMedia');
const Member = require('../models/Member');
const User = require('../models/User')

function createGroup(creator, name, mode, members, description) {
    return new Promise((resolve, reject) => {
        GroupMedia.create({creator: creator, mode: mode, name: name, description: description}).
        then(groupResult => {
            let id = groupResult._id.toString();
            if (!members || members.length === 0) {
                resolve(groupResult._id.toString());
            }
            return addMembers(members, id)
        }).
        then(membersData => {
            resolve(membersData);
        }).
        catch(err => {reject(err)})
    })
}
function _f(val) {
    return parseInt(val.toString());
}

function deleteGroup(idGroup) {
    return new Promise((resolve, reject) => {
        GroupMedia.deleteOne({_id: idGroup}).then(updData => {
            return Member.deleteMany({groupId: idGroup})
        }).then(result => {
            resolve(result)
        }).catch(err => {
            reject(err);
        })
    })
}

function changeGroupName(newName, idGroup) {
    return new Promise((resolve, reject) => {
        GroupMedia.updateOne({_id: idGroup}, {"$set": {name: newName}}).then(updData => {
            resolve(updData);
        }).catch(err => {
            reject(err);
        })
    })
}


function addMembers(members, groupId) {
    return new Promise((resolve, reject) => {
        let memberObjects = null;
        if (typeof members === typeof "stroka") {
            members = JSON.parse(members);
        }
        _parseMembers(members, groupId).then(mem => {
            memberObjects = mem;
            return Promise.all([Member.find({"$or": memberObjects}), GroupMedia.findOne({_id: groupId})])
        }).then(results => {
            let mustBeEmpty = results[0];
            let gr = results[1];
            for (let key in memberObjects) {
                let mem = memberObjects[key];
                if (mem.user.toString() === gr.creator.toString()) {
                    memberObjects.splice(key, 1);
                    break;
                }
            }
            for (let key in mustBeEmpty) {
               let index = members.indexOf(mustBeEmpty[key]._id.toString());
               members.splice(index, 1);
               memberObjects.splice(index, 1);
            }

           gr.usersNumber = _f(gr.usersNumber) + memberObjects.length;
           return Promise.all([Member.insertMany(memberObjects), gr.save()]);
        }).then(results => {
            resolve('Saved members ' + results.length)
        }).catch(err => reject(err));
    })
}

function deleteMembers(members, groupId) {
    return new Promise((resolve, reject) => {
        let memberObjects = null;
        let count = 0;
        if (typeof members === typeof "stroka") {
            members = JSON.parse(members);
        }
        _parseMembers(members, groupId).then(mem => {
            memberObjects = mem;
            return Promise.all([Member.deleteMany({"$or": memberObjects}), GroupMedia.findOne({_id: groupId})])
        }).then(results => {
            count = results[0].deletedCount;
            let gr = results[1];
            gr.usersNumber = gr.usersNumber - count;
            return gr.save();
        }).then(() => {
            resolve('Deleted members ' + count)
        }).catch(err => reject(err));
    })
}

function switchOwner(groupId, user_id, isOwner=true) {
    return new Promise((resolve, reject) => {
        GroupMedia.findOne({_id: groupId}).then(groupM => {
            if (groupM.creator.toString() === user_id) {
                reject({errors: "You cant change permissions of creator"});
            }
            return Member.findOne({user: user_id, groupId: groupId})
        }).then(member => {
            if (!member) {
                reject({errors:"Member not found"});
            }
            member.Role = isOwner? "Owner" : "Listener";
            return member.save()
        }).then(() => {
            resolve({data:"saved"});
        }).catch(err => {
            reject({errors: err});
        })
    })
}

function switchSender(groupId, userId) {

    return new Promise((resolve, reject) => {
        Promise.all([
            GroupMedia.findOne({_id: groupId}),
            Member.findOne({groupId: groupId, user: userId})]).then(results => {
            if (!results[0] || !results[1]) {
                reject("group or user not found");
            }
            if (results[1].Role !== "Owner") {
                reject("This user is not owner");
            }
            results[0].currentSender = userId;
            return results[0].save();
        }).then(() => {
            resolve("changed");
        }).catch(err => {
            reject(err);
        })
    });
}

function _parseMembers(members, groupId) {
    return new Promise((resolve, reject) => {
        let fin = [];
        for (let key in members) {
            fin.push({nickname: members[key]});
        }
        User.find({$or : fin}).then(users => {
            let memberObjects = [];
            for (let key in users) {
                let idMember = users[key]._id.toString();
                memberObjects.push({user: idMember, groupId: groupId});
            }
            resolve(memberObjects);
        }).catch( err => reject(err));
    })


}

function getMembers(groupId) {
    return new Promise((resolve, reject) => {
        Member.find({groupId: groupId}).then(members => {
            resolve({data: members});
        }).catch( err => reject(err));
    })

}

module.exports = {
    getMembers: getMembers,
    createGroup: createGroup,
    deleteGroup: deleteGroup,
    changeGroupName: changeGroupName,
    addMembers: addMembers,
    deleteMembers: deleteMembers,
    switchOwner: switchOwner,
    switchSender: switchSender
};