var express = require("express")
var bodyParser = require("body-parser")
var session = require("express-session")
const flash = require("express-flash")
const fileUpload = require('express-fileupload');
var app = express()
var server = app.listen(8000)
var io = require("socket.io")(server)

app.use(express.static(__dirname + "/client/static"))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: null } /* cookie last in 10 minutes */
}))
app.use(flash())
app.use(fileUpload())
app.set("views", __dirname + "/client/static/views")
app.set("view engine", "ejs")

require("./server/config/routes")(app)
require("./server/config/socket")(io)
