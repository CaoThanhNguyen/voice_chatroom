var UserController = require("../controllers/user");

module.exports = function(io) {
    var users_status = {}
    UserController.findAll()
    .then(users => {
        if (users.length > 0) {
            for (var user of users) {
                users_status[user._id] = "offline"
            }
        }
    })
    io.on("connection", (socket) => {
        console.log("Connecting...")
        socket.emit("initialize", users_status)
        socket.on("new_message", message => {
            console.log(message)
            socket.broadcast.emit("updated_message", message)
        })

        socket.on("change_username", data => {
            console.log(data);
            socket.broadcast.emit("updated_username", data)
        })

        socket.on("new_avatar", data => {
            console.log(data);
            socket.broadcast.emit("updated_avatar", data)
        })

        socket.on("change_status", data => {
            console.log(data);
            users_status[data.user_id] = data.status;
            socket.broadcast.emit("updated_status", data)
        })

        socket.on("join", data => {
            // gather information of this user
            console.log(data)
            UserController.findUserById(data.user_id) 
            .then(user => {
                if (user) {
                    users_status[data.user_id] = "online";
                    socket.broadcast.emit("newcomer", user)
                }
            })
            .catch(err => {
                console.log(err)
            })
        })

        socket.on("left", data => {
            console.log(data)
            UserController.findUserById(data.user_id)
            .then(user => {
                if (user) {
                    users_status[data.user_id] = "offline";
                    socket.broadcast.emit("updated_offline", user)
                }
            })
            .catch(err => {
                console.log(err)
            })
        })

        socket.on("deteleAccount", data => {
            delete users_status[data.user_id];
            socket.broadcast.emit("someone_left", data)
        })
    })
}