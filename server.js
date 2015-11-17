// server.js
var express = require('express');
var app = express();
var port = 8080;

var rooms = [];
var games = [];

app.set('view engine', 'ejs');

var Game = require('./logic/Game.js');
var User = require('./logic/User.js');
var UsersCollection = require('./logic/UsersCollection.js');

var usersCollection = new UsersCollection();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/lib'));



// index
app.get('/', function (req, res) {
    res.render('index');
});


var io = require('socket.io').listen(app.listen(port));
console.log('Serwer nasłuchuje na porcie ' + port);




io.sockets.on('connection', function (socket) {

    //Mechanizm logowania do gry
    socket.on('login', function (data, callback) {
        var isUserExists = false;

        if (usersCollection.isExists(data.nickname)) {
            isUserExists = true;
        } else {
            console.log(data.nickname + " podłączył się do gry");
            socket.nickname = data.nickname;
            
            user = new User(data.nickname, socket.id);
            usersCollection.add(user);
            
            console.log("Liczba graczy " + usersCollection.getSize());
            console.log('socket id: ' + socket.id);
        }
        socket.emit('loginResponse', {
            isUserExists: isUserExists,
            players: usersCollection.getList()
        });

        io.sockets.emit('addToPlayersList', {
            nickname: socket.nickname
        });

    });

    //Obsługa rozłączenia użytkownika
    socket.on('disconnect', function () {
        console.log(socket.nickname + " zamknął połączenie");
        removeUser(socket.nickname);
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

        var receiver = usersCollection.getByNickname(data.to);
        io.to(receiver.getId()).emit('newInvite', {from: data.from});

    });

    //Odpowiedź na zaproszenie do gry
    socket.on('inviteResponse', function (data) {
        var receiver = usersCollection.getByNickname(data.to);
        if (data.accept) {
            var roomId = generateRoomId();
            var game = new Game(receiver.getNickname(), socket.nickname, roomId);

            games.push({roomId: roomId, game: game});

            io.sockets.connected[receiver.getId()].join(roomId);
            socket.join(roomId);
            
            
            
            io.to(roomId).emit('startGame', {
                gameParams: game.getStartGameParameters()
            });
        } else {
            io.to(receiver.getId()).emit('inviteRefused', {
            });
        }
    });
    
    socket.on('validateMove', function(data) {
        console.log('walidacja ruchu');
        console.log(JSON.stringify(data));
        
        
        
    });
});

var getGameByRoomId = function (roomId) {
    var result = null;
    games.forEach(function (game) {
        if (game.roomId === roomId)
            result = game.game;
    });
    return result;
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