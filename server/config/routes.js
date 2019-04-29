var RegisterController = require("../controllers/register");
var LoginController = require("../controllers/login");
var MessageController = require("../controllers/message");
var UserController = require("../controllers/user");


module.exports = function(app) {

    app.get("/",(req, res) => {
        res.render("index")
    })

    app.get("/login", (req, res) => {
        res.render("login")
    })

    app.get("/register", (req, res) => {
        res.locals.session = req.session;
        res.render("register")
    })

    app.post("/register", (req, res) => {
        RegisterController.register(req, res)
    })

    app.get("/public_chatroom", (req, res) => {
        LoginController.success(req, res)
    })

    app.post("/login", (req, res) => {
        LoginController.login(req, res)
    })

    app.get("/logout", (req, res) => {
        console.log("Logout")
        LoginController.logout(req, res)
    })

    // POST route for storing new message in the db
    app.post("/messages", (req, res) => {
        MessageController.createMessage(req, res) 
    })

    app.post("/users/:id", (req, res) => {
        UserController.updateUser(req, res)
    })

    app.post("/users/:id/upload_avatar", (req, res) => {
        UserController.updateAvatar(req, res)
    })

    app.get("/users/:id/delete", (req, res) => {
        UserController.deleteUser(req, res)
    })

    app.all("*", (req, res) => {
        res.render("page_not_found")
    })
}