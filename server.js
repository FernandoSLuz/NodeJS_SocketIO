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
    client.emit("connected", "You have connected to the server.");

    client.on("avatarCreated", function(msg){
        var avatar = msg
        avatar["user_id"] = client.id
        client.broadcast.emit("newAvatar", avatar);
    });

    client.on("avatarTransformUpdate", function(msg){
        var avatar = msg
        avatar["user_id"] = client.id
        client.broadcast.emit("otherAvatarTransformUpdate", avatar)
    });
    client.on("disconnect", function(){
        avatar = {}
        avatar["user_id"] = client.id
        client.broadcast.emit("destroyThisAvatar", avatar)
        delete clients[client.id];
    });
});

