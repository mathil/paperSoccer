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
            socket.nickname = data.nickname;
            user = new User(data.nickname, socket.id);
            usersCollection.add(user);
            console.log(data.nickname + " podłączył się. Liczba użytkowników: " + usersCollection.getSize());
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
        var user = usersCollection.getByNickname(socket.nickname);
        usersCollection.remove(socket.nickname);
        console.log(user.getNickname() + " rozłączył się. Liczba użytkowników: " + usersCollection.getSize());
        io.sockets.emit('removeFromPlayersList', {
            nickname: socket.nickname
        });
        if (user.getHasGame()) {
            var game = getGameByRoomId(user.getRoomId());
            io.to(game.getRoomId()).emit('stopGame', {
                nickname: socket.nickname
            });
        }
    });

    //Wysłanie wiadomości na czacie globalnym
    socket.on('globalChatMessage', function (data) {
        io.sockets.emit('updateGlobalChat', {
            message: '[' + getCurrentTimeAsString() + '] ' + socket.nickname + ': ' + data.message
        });
    });

    //Wysłanie wiadomości na czacie gry
    socket.on('gameChatMessage', function (data) {
        var roomId = usersCollection.getByNickname(socket.nickname).getRoomId();
        io.to(roomId).emit('updateGameChat', {
            message: '[' + getCurrentTimeAsString() + ']' + socket.nickname + ': ' + data.message
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
        var user = usersCollection.getByNickname(socket.nickname);
        if (data.accept) {
            var roomId = generateRoomId();
            var game = new Game(socket.nickname, receiver.getNickname(), roomId);

            games.push({roomId: roomId, game: game});

            io.sockets.connected[receiver.getId()].join(roomId);
            socket.join(roomId);

            receiver.setHasGame(true);
            receiver.setRoomId(roomId);
            user.setHasGame(true);
            user.setRoomId(roomId);

            io.to(roomId).emit('startGame', {
                gameParams: game.getStartGameParameters()
            });
        } else {
            io.to(receiver.getId()).emit('inviteRefused');
        }
    });

    socket.on('validateMove', function (data) {
//        console.log('walidacja ruchu');
//        console.log(JSON.stringify(data));
        var gameRoomId = usersCollection.getByNickname(socket.nickname).getRoomId();
        var game = getGameByRoomId(gameRoomId);

        var validate = game.validateMove(data.to.x, data.to.y);
//        console.log(validate);
        io.to(gameRoomId).emit('validateResponse', validate);

    });
});

var getCurrentTimeAsString = function () {
    var date = new Date();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    // hour = hour % 2 != 0 ? hour : '0' + hour;

    return hour + ":" + minutes + ":" + seconds;
};

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