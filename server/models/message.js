var mongoose = require("../config/mongoose")

var MessageSchema = new mongoose.Schema({
    sender_id: {type: String, required: true},
    sender_avatar: {type: String, required: true},
    sender_username: {type: String, required: true},
    content: {type: String, required: true},
}, {timestamps: true})

mongoose.model("Message", MessageSchema);
var Message = mongoose.model("Message")

module.exports = Message;