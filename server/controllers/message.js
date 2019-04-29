var Message = require("../models/message");
var handleError = require("./errors");

module.exports = {
    getMessageById: function(id) {
        Message.findOne({_id: id})
    },

    getMessagesBySenderId: function(senderId) {
        return Message.find({senderId: senderId})
    },

    createMessage: function(req, res) {
        // console.log("create new message")
        // console.log(req.body)
        Message.create({
            sender_id: req.body.sender_id,
            sender_avatar: req.body.sender_avatar,
            sender_username: req.body.sender_username,
            content: req.body.content,
        })
        .then(message => {
            // console.log(`New created message: ${message}}`)
            res.json({
                status: "success", 
                content: message,
            })
        })
        .catch(err => {
            res.json({
                status: "error",
                content: err,
            }) 
        })
    },

    getAllMessages: function() {
        return Message.find({})
    },

}