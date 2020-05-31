'use strict';

// [START appengine_websockets_app]
const app = require('express')();
app.set('view engine', 'pug');

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
    res.render('index.pug');
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

if (module === require.main) {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
        console.log('Press Ctrl+C to quit.');
    });
}
// [END appengine_websockets_app]

var clientsList = [];
//SocketIO vem aqui
io.on("connection", function (client) {
    var clientId = client.id
    addOnDict(clientsList, { "clientId": clientId })
    //EMIT GET ALL USERS
    client.emit("connected", { "clientId": clientId });

    client.on("avatarCreated", function (msg) {
        //SEND INFO ABOUT THE NEW USER TO OTHER USERS
        var avatar = msg
        avatar["clientId"] = clientId
        updateDict(clientsList, "clientId", avatar["clientId"], avatar)
        client.broadcast.emit("newAvatarCreated", avatar);


        //SEND THE LIST OF OLDER USERS TO NEW USER
        var olderAvatars = {}
        olderAvatars["clientId"] = clientId
        olderAvatars["avatars"] = clientsList
        client.emit("setOlderAvatars", olderAvatars)
    });

    client.on("avatarTransformUpdate", function (msg) {
        //UPDATE TRANSFORM FROM SPECIFIC USER
        var avatar = msg
        avatar["clientId"] = clientId
        //UPDATE SERVER DICTIONARY ABOUT ALL CLIENTS
        updateDict(clientsList, "clientId", avatar["clientId"], avatar)
        client.broadcast.emit("otherAvatarTransformUpdate", avatar)
    });
    client.on("disconnect", function () {
        var avatar = {}
        avatar["clientId"] = clientId
        client.broadcast.emit("destroyThisAvatar", avatar)
        removeFromDict(clientsList, "clientId", avatar["clientId"])
    });
});

var updateDict = function (dict, key, value, elements) {
    for (var i = 0; i < clientsList.length; i++) {
        var obj = dict[i];
        if (obj[key] == value) {
            obj = Object.assign(obj, elements)
            break;
        }
    }
}
var addOnDict = function (dict, elements) {
    dict.push(elements)
}
var removeFromDict = function (dict, key, value) {
    for (var i = 0; i < clientsList.length; i++) {
        var obj = dict[i];
        if (obj[key] == value) {
            dict.splice(i, 1);
            break;
        }
    }
}