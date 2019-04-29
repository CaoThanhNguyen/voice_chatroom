var UserController = require("./user");
var MessageController = require("../controllers/message");
var handleError = require("./errors");
var bcrypt = require("bcrypt")

function isLoggedIn(req) {
    return ("login_user" in req.session);
}


module.exports = {
    login: function(req, res) {
        // console.log(req.body.email)
        // console.log(req.body.password)
        UserController.findUserByEmail(req.body.email)
        .then(user => {
            // console.log("user", user)
            if (!user) {
                // cannot find the email
                req.flash("errors", "Doesn't have an account? Please register first!")
                res.redirect("/register")
                return;
            }
            bcrypt.compare(req.body.password, user.password)
            .then(result => {
                // console.log("Bcrypt compare result = ", result)
                if (!result) {
                    req.flash("errors", "Email/Password does not match!")
                    res.redirect("/login")
                    return;
                }
                req.session["login_user"] = {
                    id: user._id,
                    username: user.username,
                    avatar_url: user.avatar_url,
                }
                res.redirect("/public_chatroom")
            })
            .catch(err => {
                console.log(err);
                req.flash("errors", "Somethind went wrong. Please try again!")
                res.redirect("/login")
            })
        })
        .catch(err => {
            handleError(err, req, res, "/login")
        })
    },

    success: function(req, res) {
        if (!isLoggedIn(req)) {
            req.flash("errors", "You need login first!")
            res.redirect("/login")
            return;
        }
        res.locals.login_user = req.session.login_user;
        console.log("success")
        console.log(req.session["login_user"])
        UserController.findUserById(req.session["login_user"].id) 
        .then(user => {
            if (!user) {
                req.flash("errors", "You need login first!");
                delete req.session["login_user"];
                res.redirect("/login");
                return;
            }
            UserController.findAll()
            .then(users => {
                MessageController.getAllMessages()
                .then(messages => {
                    var context = {
                        users: users,
                        login_user: user,
                        messages: messages,
                    }
                    res.render("public_chatroom", context)
                }) 
            })
        })
        .catch(err => {
            req.flash("errors", "Something went wrong. Please try again");
            delete req.session["login_user"];
            res.redirect("/login");
        })
    },

    logout: function(req, res) {
        // console.log("logout----")
        req.session.destroy();
        res.redirect("/login")
    }
}