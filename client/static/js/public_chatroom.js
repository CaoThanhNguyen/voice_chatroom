$(document).ready(function() {
    var socket = io();
    const _id = $(".message-input input").attr("sender_id")
    socket.emit("join", {user_id: _id}) 

    socket.on("initialize", users_status => {
        console.log("initialize")
        console.log(users_status)
        $("li.contact").each(function() {
            updateStatus($(this), users_status[$(this).attr("user_id")]) 
        })
    })
    
    socket.on("updated_message", (message) => {
        $(`<li class="sent"><img src="${message.sender_avatar}" alt="" data-toggle="tooltip"
            data-placement="bottom" title="${message.sender_username}"/><p>` 
            + message.content + '</p></li>').appendTo($('.messages ul'));
        $('[data-toggle="tooltip"').tooltip();
        $(".messages").animate({ scrollTop: $(".messages")[0].scrollHeight });
    })

    socket.on("updated_username", data => {
        $(`.meta p:contains(${data.old_name})`).text(data.new_name)
        // Update tooltips
        $(".messages ul li img").each(function() {
            if($(this).attr("data-original-title") == data.old_name) {
                $(this).attr("data-original-title", data.new_name).tooltip("hide")
            }
        })
    })

    socket.on("updated_avatar", data => {
        $(`img`).each(function() {
            if($(this).attr("src") == data.old_avatar) {
                $(this).attr("src", data.new_avatar)
            }
        })
    })

    socket.on("updated_status", data => {
        $("li.contact").each(function() {
            if($(this).attr("user_id") == data.user_id) {
                // change the status
                if (data.status == "offline") {
                    $(this).find("span").removeClass("online");
                    $(this).find("span").addClass("offline")
                } else {
                    $(this).find("span").removeClass("offline");
                    $(this).find("span").addClass("online")
                }
            }
        })
    })

    socket.on("newcomer", data => {
        console.log("newcomer, data = ", data)
        var contacts = $("li.contact");
        for(let contact of contacts) {
            console.log($(contact).attr("user_id"))
            if($(contact).attr("user_id") == data._id) {
                // change the status of this user to online
                console.log('change to online status')
                $(contact).find("span").removeClass("offline");
                $(contact).find("span").addClass("online")
                return;
            }
        }
        // If newcoming is a very new one, add this user to the contact list
        console.log("add a new contact")
        $("div#contacts ul").append(`
            <li class="contact" user_id="${data._id}">
                <div class="wrap">
                    <span class="contact-status online"></span>
                    <img src="${data.avatar_url}" alt="" />
                    <div class="meta">
                        <p class="name">${data.username}</p>
                    </div>
                </div>
            </li>`)
    })

    socket.on("updated_offline", data => {
        console.log("updated_offline, data = ", data)
        var contacts = $("li.contact");
        for(let contact of contacts) {
            console.log($(contact).attr("user_id"))
            if($(contact).attr("user_id") == data._id) {
                // change the status of this user to offline
                console.log('change to offline status')
                $(contact).find("span").removeClass("online");
                $(contact).find("span").addClass("offline")
                return;
            }
        }
    })

    socket.on("someone_left", data => {
        // remove out of the contacts
        $("li.contact").each(function() {
            if($(this).attr("user_id") == data.user_id) {
                $(this).remove()
                return false;
            }
        })
    })

    function updateStatus(element, status) {
        if (status == "online") {
            element.find("span").removeClass("offline")
            element.find("span").addClass("online")
        } else if (status == "offline") {
            element.find("span").removeClass("online")
            element.find("span").addClass("offline")
        }
    }

    /* ---------------- For Voice Recognition Feature ----------------- */
    $(".messages").animate({ scrollTop: $(".messages")[0].scrollHeight });
    var recognizing = false;
    var final_transcript = "";
    if (!('webkitSpeechRecognition' in window)) {
        upgrade();
    } else {
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 10; // English
        recognition.onstart = function() {
            console.log("start converting...")
            recognizing = true;
        }
        recognition.onresult = function(event) {
            console.log("result event", event.results)

            var interim_transcript = '';
            if (typeof(event.results) == 'undefined') {
                recognition.onend = null;
                recognition.stop();
                upgrade();
                return;
            }
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            console.log("interim_transcript", interim_transcript)
            final_transcript = capitalize(final_transcript);
            console.log("final_transcript: ", final_transcript);
            $("input#message").val(`${final_transcript}`);

        }
        recognition.onerror = function(event) {
            console.log("error", event)
            alert(`SpeechRecognitionError: ${event.error}`);
        }
        recognition.onend = function() { 
            recognizing = false;
            $(".microphone").removeClass("fa-microphone-slash");
            $(".microphone").addClass("fa-microphone")
            $("#loader").remove()
            console.log("end...")
        }
    }
    $(".microphone").click(function() {
        if(recognizing) {
            recognition.stop();
            return;
        }
        // display three dot gif
        $(this).removeClass("fa-microphone")
        $(this).addClass("fa-microphone-slash")
        $(".messages").append(`<img id="loader" src="../img/loader.gif" width="50px">`)
        $(".messages").animate({ scrollTop: $(".messages")[0].scrollHeight });
        recognition.start(); 
    })

    $("button.submit").click((event) => {
        $("#loader").remove()
        submitMessage();
    })

    $(".message-input input").keypress((event) => {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == 13) {
            submitMessage();
            if(recognizing) {
                recognition.stop();
            }
        }
    })

    function submitMessage() {
        if(recognizing) {
            recognition.stop();
        }
        message = $(".message-input input").val();
        if($.trim(message) == '') {
		    return false;
	    }
        sender_id = $(".message-input input").attr("sender_id")
        sender_avatar = $(".message-input input").attr("sender_avatar")
        sender_username = $(".message-input input").attr("sender_username")
        $(`<li class="replies">
                <img src="${sender_avatar}" alt="" data-toggle="tooltip"
                    data-placement="bottom" title="${sender_username}"/>
                <p>${message}</p></li>`)
        .appendTo($('.messages ul'));
        $('[data-toggle="tooltip"').tooltip();
        $(".messages").animate({ scrollTop: $(".messages")[0].scrollHeight });
        // save the message into the database
        var messageInfo = {
            sender_id: sender_id,
            sender_avatar: sender_avatar,
            sender_username: sender_username,
            content: message,
        }
        $.post("/messages", messageInfo)
        .then(message => {
            socket.emit("new_message", message.content)
        })
        .catch(err => {
            console.log(err)
        })
        // reset the transcript
        final_transcript = ""
        $('.message-input input').val(null);
    }

    var first_char = /\S/;
    function capitalize(s) {
        return s.replace(first_char, function(m) { return m.toUpperCase(); });
    }

    /* --------------- For Public Chatroom Other Effects ----------------- */
    $("#profile-img").click(function() {
        $("#status-options").toggleClass("active");
    });

    $(".expand-button").click(function() {
        $("#profile").toggleClass("expanded");
        $("#contacts").toggleClass("expanded");
    });

    $("#status-options ul li").click(function() {
        $("#profile-img").removeClass();
        $("#status-online").removeClass("active");
        $("#status-offline").removeClass("active");
        $(this).addClass("active");
	
        if($("#status-online").hasClass("active")) {
            $("#profile-img").addClass("online");
            // broadcast online status to other users
            socket.emit("change_status", {user_id: _id, status: "online"})
        } else if ($("#status-offline").hasClass("active")) {
            $("#profile-img").addClass("offline");
            socket.emit("change_status", {user_id: _id, status: "offline"})
        } else {
            $("#profile-img").removeClass();
        };
	
        $("#status-options").removeClass("active");
    });

    $("button#editBtn").click(() => {
        // get data
        var first_name = $("input[name=first_name]").val();
        var last_name = $("input[name=last_name]").val();
        var username = $("input[name=username]").val();
        $.post(`/users/${_id}`, {
            first_name: first_name,
            last_name: last_name,
            username: username,
        })
        .then(data => {
            if (data.status === "success") {
                var old_name = $("div#profile .wrap > p").text();
                console.log("old_name", old_name)
                var new_name = data.content.username;
                // update username on other places
                $("div#profile .wrap > p").text(new_name)
                $("div.contact-profile > p").text(new_name)
                $(".message-input input").attr("sender_username", new_name)

                // Update tooltips 
                $(".messages ul li img").each(function() {
                    if($(this).attr("data-original-title") == old_name) {
                        $(this).attr("data-original-title", new_name).tooltip("hide")
                    }
                })

                // broadcast this change to other users
                socket.emit("change_username", {
                    old_name: old_name,
                    new_name: new_name,
                })

            } else {
                alert(data.content.message)
            }
            $("#profile").toggleClass("expanded");
            $("#contacts").toggleClass("expanded");
        })
    })

    // For uploading avatar
    $(".upload-button").click(() => {
        $(".file-upload").click();
    })

    var readURL = function(input) {
        if(input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = (e) => {
                var newfile = e.target.result;
                var filename = input.files[0].name;
                var old_avatar = $('#profile-img').attr("src");
                // send back this new avatar to the server to store 
                // and update user's info and messages belong to this user in the database
                $.post(`/users/${_id}/upload_avatar`, {file: newfile, filename: filename})
                .then(data => {
                    if (data.status == "error") {
                        alert("Something went wrong on the server side. Please try again!")
                    } else {
                        let avatar_url = data.content.avatar_url;
                        // apply new avatar on messages and on contact profile
                        $('#profile-img').attr("src", avatar_url)
                        $(".contact-profile > img").attr("src", avatar_url);
                        $(".replies img").attr("src", avatar_url);
                        $("input#message").attr("sender_avatar", avatar_url)

                        // broadcast the new avatar to other users
                        console.log(data.content.avatar_url)
                        socket.emit("new_avatar", {old_avatar: old_avatar, new_avatar: data.content.avatar_url})
                    }
                })
            }
            reader.readAsDataURL(input.files[0])
        }
    }

    $('.file-upload').change(function() {
        readURL(this)
    })

    $(".social-media #logout").click(()=> {
        // notify to the server about the logout activity
        socket.emit("left", {user_id: _id})
        window.location.href = "/logout"
    })
    $("#confirmedDeleteBtn").click(() => {
        $.get(`/users/${_id}/delete`)
        .then(data => {
            if(data.status == "success") {
                socket.emit("deteleAccount", {user_id: _id})
                window.location.href="/"
            }
        })
        .catch(err => {
            console.log(err);

        })
    })
}) 