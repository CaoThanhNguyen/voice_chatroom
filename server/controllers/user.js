var User = require("../models/user");
var Message = require("../models/message");
// var handleError = require("./errors")
var fs = require("fs")

module.exports = {
    create: function(userInfo) {
        return User.create(userInfo)
    },

    findUserByEmail: function(email) {
        return User.findOne({email: email})
    },
    
    findUserById: function(id) {
        return User.findOne({_id: id})
    },

    findAll: function() {
        return User.find({})
    },

    updateUser: function(req, res) {
        User.findOneAndUpdate({_id: req.params.id}, {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username
        }, {new: true, runValidators: true})
        .then(updated_user => {
            console.log(updated_user)
            // update all messages belong to this user
            Message.find({sender_id: req.params.id})
            .then(messages => {
                console.log(messages)
                if (messages.length > 0) {
                    for (var message of messages) {
                        message.sender_username = updated_user.username;
                        message.sender_avatar = updated_user.avatar_url;
                        message.save();
                    }
                }
            }) 
            // update session
            // req.session.login_user.username = updated_user.username;
            // req.app.locals.login_user = req.session.login_user;
            res.json({
                status: "success",
                content: updated_user
            })
        })
        .catch(err => {
            res.json({
                status: "error",
                content: err,
            })
        })
    },
    
    updateAvatar: function(req, res) {
        console.log("saving file....")
        var filePath =`./client/static/img/${req.body.filename}`
        var data = req.body.file.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(data, 'base64');
        fs.writeFile(filePath, buf, () => {
            console.log("File saved!")
        })
        // update database
        var avatar_url = `../img/${req.body.filename}`
        User.findOneAndUpdate({_id: req.params.id}, {avatar_url: avatar_url}, 
            {new: true, runValidators: true})
        .then(updated_user => {
            console.log(updated_user)
            // update sender_avatar value of all messages belong to this user
            Message.find({sender_id: req.params.id})
            .then(messages => {
                if (messages.length > 0) {
                    for (var message of messages) {
                        message.sender_avatar = avatar_url;
                        message.save()
                    }
                }
            })
            // update the session 
            // req.session.login_user.avatar_url = avatar_url;
            // req.locals.login_user = req.session.login_user;
            res.json({
                status: "success",
                content: updated_user,
            })
        })
        .catch(err => {
            console.log(err);
            res.json({
                status: "error",
                content: err,
            })
        })
    },

    deleteUser: function(req, res) {
        User.findOneAndDelete({_id: req.params.id})
        .then(data => {
            req.session.destroy();
            res.json({
                status: "success",
                content: data,
            })
        })
        .catch(err => {
            console.log(err);
            res.json({
                status: "error",
                content: err
            })
        })
    }
}