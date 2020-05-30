var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = {};

app.get('/', function(req, res){
res.send('server is running');
});
http.listen(3000, function(){
    console.log('listening on port 3000');
});
//SocketIO vem aqui
io.on("connection", function (client) {
    var clientId = client.id
    //EMIT GET ALL USERS
    client.emit("connected", {"clientId": clientId});

    client.on("avatarCreated", function(msg){
        var avatar = msg
        avatar["clientId"] = clientId
        client.broadcast.emit("newAvatarCreated", avatar);
    });

    client.on("avatarTransformUpdate", function(msg){
        var avatar = msg
        avatar["clientId"] = clientId
        client.broadcast.emit("otherAvatarTransformUpdate", avatar)
    });
    client.on("disconnect", function(){
        console.log("disconected")
        avatar = {}
        avatar["clientId"] = clientId
        client.broadcast.emit("destroyThisAvatar", avatar)
        delete clients[clientId];
    });
});

