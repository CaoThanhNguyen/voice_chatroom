var UserController = require("./user")
var bcrypt = require("bcrypt")

module.exports = {
    register: function(req, res) {
        req.session["input_data"] = req.body;
        if (req.body.password.length < 8) {
            req.flash("errors", "Passwords should have at least 8 charaters")
            res.redirect("/register")
            return;
        }
        // check if password match with confirmed_password
        if (req.body.password !== req.body.confirmed_password) {
            req.flash("errors", "Your password and confirmation password do not match!")
            res.redirect("/register");
            return;
        }
        bcrypt.hash(req.body.password, 10)
        .then(hashed_password => {
            UserController.create({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                email: req.body.email,
                password: hashed_password,
            })
            .then(user => {
                req.session.login_user = {
                    id: user._id,
                    username: user.username,
                }
                // TODO: broadcast new user to other users in the chatroom

                res.redirect("/public_chatroom")
            })
            .catch(err => {
                // req.session["input_data"] = req.body;
                if (err.code == 11000) {
                    req.flash("errors", "This email is in used!")
                    res.redirect("/register")
                    return;
                }
                handleError(err, req, res, "/register")
            })
        })
        .catch(err => {
            console.log(err)
            req.flash("errors", "Something went wrong. Please try again!")
            res.redirect("/register")
        })
    }
}