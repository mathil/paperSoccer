

// server.js
// load the things we need
var express = require('express');
var app = express();
var port = 8080;

var clients = [];
var rooms = [];
var games = [];

// set the view engine to ejs
app.set('view engine', 'ejs');

var game_core = require('./logic/Game.js');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/lib'));



// index page
app.get('/', function (req, res) {
    res.render('index');
});


var io = require('socket.io').listen(app.listen(port));
console.log('Serwer nasłuchuje na porcie ' + port);




io.sockets.on('connection', function (socket) {

    //Mechanizm logowania do gry
    socket.on('login', function (data, callback) {
        var isUserExists = false;
        var players = null;

        if (getSocketByNickname(data.nickname) !== null) {
            isUserExists = true;
        } else {
            console.log(data.nickname + " podłączył się do gry");
            socket.nickname = data.nickname;
            clients.push({nickname: data.nickname, id: socket.id, hasGame: false});
            console.log("Liczba graczy " + clients.length);
            players = clients;
            console.log('socket id: ' + socket.id);
        }
        socket.emit('loginResponse', {
            isUserExists: isUserExists,
            players: players
        });

        io.sockets.emit('addToPlayersList', {
            nickname: socket.nickname
        });

    });

    //Obsługa rozłączenia użytkownika
    socket.on('disconnect', function () {
        console.log(socket.nickname + " zamknął połączenie");
        removeClient(socket.nickname);
        io.sockets.emit('removeFromPlayersList', {
            nickname: socket.nickname
        });

    });

    //Wysłanie wiadomości na czacie globalnym
    socket.on('globalChatMessage', function (data) {
        io.sockets.emit('updateGlobalChat', {
            message: socket.nickname + " " + getCurrentTimeAsString() + ": " + data.message
        });
    });

    //Zaproszenie do gry
    socket.on('invite', function (data) {
        console.log("Zaproszenie do gry od " + data.from + " dla " + data.to);

        var receiver = getSocketByNickname(data.to);
        io.to(receiver.id).emit('newInvite', {from: data.from});

    });

    //Odpowiedź na zaproszenie do gry
    socket.on('inviteResponse', function (data) {
        var receiver = getSocketByNickname(data.to);
        if (data.accept) {
            var roomId = generateRoomId();
            var game = new game_core.Game(receiver.nickname, socket.nickname, roomId);
            
            games.push({roomId: roomId, game: game});
            
            io.sockets.connected[receiver.id].join(roomId);
            socket.join.roomId;
            io.to(receiver.id).emit('inviteResponse', {
                response: data.accept,
                game: game
            });
        }

    });

});



var getSocketByNickname = function (nickname) {
    var result = null;
    clients.forEach(function (client) {
        if (client.nickname === nickname) {
            result = client;
        }
        ;
    });
    return result;
};

var getGameByRoomId = function(roomId){
    var result = null;
    games.forEach(function(game) {
        if(game.roomId === roomId)
            result = game.game;
    });
    return result;
};


var getCurrentTimeAsString = function () {
    var date = new Date();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    // hour = hour % 2 != 0 ? hour : '0' + hour;

    return hour + ":" + minutes + ":" + seconds;
};

var removeClient = function (nickname) {
    var index = -1;
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].nickname === nickname) {
            index = i;
            i = clients.length;
        }
    }
    if (index > -1) {
        clients.splice(index, 1);
    }
};

var generateRoomId = function () {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var id = "";
    for (var i = 0; i < 10; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    rooms.push(id);
    return id;
};