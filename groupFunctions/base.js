const GroupMedia = require('../models/GroupMedia');
const Member = require('../models/Member');

function createGroup(creator, name, mode, members) {
    return new Promise((resolve, reject) => {
        GroupMedia.create({creator: creator, mode: mode, name: name}).
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
        let memberObjects = _parseMembers(members, groupId);
        Member.find({"$or": memberObjects}).then(mustBeEmpty => {
           for (let key in mustBeEmpty) {
               let index = members.indexOf(mustBeEmpty[key]._id.toString());
               members.splice(index, 1);
               memberObjects.splice(index, 1);
           }
           return Member.insert(memberObjects);
        }).then(results => {
            resolve('Saved members ' + results.insertedCount)
        }).catch(err => reject(err));
    })
}

function deleteMembers(members, groupId) {
    return new Promise((resolve, reject) => {
        let memberObject = _parseMembers(members, groupId);
        Member.deleteMany({"$or": memberObject}).then(result => {
            resolve(result)
        }).catch(err => {
            reject(err);
        })
    })
}

function switchOwner(groupId, user_id, isOwner=true) {
    return new Promise((resolve, reject) => {
        GroupMedia.findOne({_id: groupId}).then(groupM => {
            if (groupM.creator.toString() === user_id) {
                reject("You cant change permissions of creator");
            }
            return Member.findOne({user: user_id, groupId: groupId})
        }).then(member => {
            if (!member) {
                reject("Member not found");
            }
            member.Role = isOwner? "Owner" : "Listener";
            return member.save()
        }).then(() => {
            resolve("saved");
        }).catch(err => {
            reject(err);
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
    let memberObjects = [];
    for (let key in members) {
        let idMember = members[key];
        memberObjects.push({user: idMember, groupId: groupId});
    }
    return memberObjects;
}


module.exports = {
    createGroup: createGroup,
    deleteGroup: deleteGroup,
    changeGroupName: changeGroupName,
    addMembers: addMembers,
    deleteMembers: deleteMembers,
    switchOwner: switchOwner,
    switchSender: switchSender
};