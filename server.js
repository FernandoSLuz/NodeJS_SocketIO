var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clientsList = [];

app.get('/', function(req, res){
res.send('server is running');
});
http.listen(3000, function(){
    console.log('listening on port 3000');
});
//SocketIO vem aqui
io.on("connection", function (client) {
    var clientId = client.id
    addOnDict(clientsList, {"clientId": clientId})
    //EMIT GET ALL USERS
    client.emit("connected", {"clientId": clientId});

    client.on("avatarCreated", function(msg){
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

    client.on("avatarTransformUpdate", function(msg){
        //UPDATE TRANSFORM FROM SPECIFIC USER
        avatar = msg
        avatar["clientId"] = clientId
        //UPDATE SERVER DICTIONARY ABOUT ALL CLIENTS
        updateDict(clientsList, "clientId", avatar["clientId"], avatar)        
        client.broadcast.emit("otherAvatarTransformUpdate", avatar)
    });
    client.on("disconnect", function(){
        avatar = {}
        avatar["clientId"] = clientId
        client.broadcast.emit("destroyThisAvatar", avatar)
        removeFromDict(clientsList,"clientId", avatar["clientId"])
    });
});

var updateDict = function (dict, key, value, elements) {
    for(i = 0; i < clientsList.length; i++){
        var obj = dict[i];
        if(obj[key] == value){
            obj = Object.assign(obj, elements)
            break;
        }
    }
}
var addOnDict = function (dict, elements) {
    dict.push(elements)
}
var removeFromDict = function(dict, key, value){
    for(i = 0; i < clientsList.length; i++){
        var obj = dict[i];
        if(obj[key] == value){
            dict.splice(i,1);
            break;
        }
    }
}