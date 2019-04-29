var mongoose = require("../config/mongoose")

var UserSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    avatar_url: {type: String, default: "../img/default_avatar.png"},
    password: {type: String, required: true},
}, {timestamps: true})

// Validators 
UserSchema.path("email").validate((email) => {
    var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
}, "Invalid email")

mongoose.model("User", UserSchema);
var User = mongoose.model("User")

module.exports = User