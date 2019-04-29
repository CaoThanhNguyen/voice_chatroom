var mongoose = require("mongoose")
mongoose.connect("mongodb://localhost/voice_chatroom", {useNewUrlParser: true, useCreateIndex: true})

module.exports = mongoose;