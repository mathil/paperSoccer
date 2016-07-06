// server.js
var express = require('express');
var app = express();
var port = 8080;

var rooms = [];
var games = [];

app.set('view engine', 'ejs');

var Game = require('./serverScripts/Game.js');
var User = require('./serverScripts/User.js');
var UsersCollection = require('./serverScripts/UsersCollection.js');
var QueryBuilder = require('./serverScripts/QueryBuilder.js');

var usersCollection = new UsersCollection();
var queryBuilder = new QueryBuilder();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/lib'));



// index
app.get('/', function (req, res) {
    res.render('index');
});


var io = require('socket.io').listen(app.listen(port));
console.log('Serwer nasłuchuje na porcie ' + port);

//
//var as = queryBuilder.checkLogin('mateusz', 'mateusz');
//console.log(as);


io.sockets.on('connection', function (socket) {

    //Mechanizm logowania do gry
    socket.on('login', function (nickname, password, loginResponse) {
        queryBuilder.checkLogin(nickname, password, function (result) {
            if (result) {
                usersCollection.add(new User(nickname, socket.id));
                var loggedUsers = usersCollection.getList();
                io.sockets.emit('addToPlayersList', {
                    nickname: socket.nickname
                });
                loginResponse(result, loggedUsers);
            } else {
                loginResponse(result, null);
            }
        });
    });

    //Rejestracja nowego użytkownika
    socket.on('registration', function (formData, registrationResponse) {
        queryBuilder.checkIsUserExists(formData.nick, formData.email, function (isExists) {
            if (!isExists) {
                if (formData.password !== formData.passwordConfirm) {
                    registrationResponse(false, "Hasło nie jest takie samo");
                } else {
                    queryBuilder.insertUser(formData.nick, formData.email, formData.password, function (success) {
                        if (success) {
                            registrationResponse(true, null);
                        } else {
                            registrationResponse(false, "Wystąpił błąd podczas tworzenia konta.");
                        }
                    });
                }
            } else {
                registrationResponse(false, "W systemie istnieje użytkownik o takim loginie lub haśle");
            }
        });
    });

    //Obsługa rozłączenia użytkownika
    socket.on('disconnect', function () {
        var user = usersCollection.getByNickname(socket.nickname);
        if (user === null) {
            return;
        }
        usersCollection.remove(socket.nickname);
        console.log(user.getNickname() + " rozłączył się. Liczba użytkowników: " + usersCollection.getSize());
        io.sockets.emit('removeFromPlayersList', {
            nickname: socket.nickname
        });
        if (user.getHasGame()) {
            var game = getGameByRoomId(user.getRoomId());
            var opponent = usersCollection.getByNickname(game.getOpponent(socket.nickname));
            opponent.setHasGame(false);
            io.sockets.emit('updatePlayersGameStatus', [
                {
                    nickname: opponent.getNickname(),
                    hasGame: opponent.getHasGame()
                }
            ])
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
            message: '[' + getCurrentTimeAsString() + '] ' + socket.nickname + ': ' + data.message
        });
    });

    //Zaproszenie do gry
    socket.on('invite', function (data) {
        console.log("Zaproszenie do gry od " + data.from + " dla " + data.to);

        var receiver = usersCollection.getByNickname(data.to);

        if (receiver.getHasGame()) {
            io.to(socket.id).emit('receiverHasGame', {receiver: receiver.getNickname()});
        } else {
            io.to(receiver.getId()).emit('newInvite', {from: data.from});
        }
    });

    //Odpowiedź na zaproszenie do gry
    socket.on('inviteResponse', function (data) {
        var opponent = usersCollection.getByNickname(data.to);
        var user = usersCollection.getByNickname(socket.nickname);
        if (data.accept) {
            var roomId = generateRoomId();
            var game = new Game(socket.nickname, opponent.getNickname(), roomId);

            games.push({roomId: roomId, game: game});

            io.sockets.connected[opponent.getId()].join(roomId);
            socket.join(roomId);

            opponent.setHasGame(true);
            opponent.setRoomId(roomId);
            user.setHasGame(true);
            user.setRoomId(roomId);

            io.sockets.emit('updatePlayersGameStatus', [
                {
                    nickname: opponent.getNickname(),
                    hasGame: opponent.getHasGame()
                },
                {
                    nickname: user.getNickname(),
                    hasGame: user.getHasGame()
                }
            ]);

            io.to(roomId).emit('startGame', {
                gameParams: game.getStartGameParameters()
            });
        } else {
            io.to(opponent.getId()).emit('inviteRefused');
        }
    });

    socket.on('validateMove', function (data) {
        var gameRoomId = usersCollection.getByNickname(socket.nickname).getRoomId();
        var game = getGameByRoomId(gameRoomId);

        var validateResponse = game.validateMove(data.to.x, data.to.y);
        io.to(gameRoomId).emit('validateResponse', validateResponse);

    });

    socket.on('leaveGame', function () {
        console.log('leaveGame');
        var user = usersCollection.getByNickname(socket.nickname);
        user.setHasGame(false);
        var gameRoomId = user.getRoomId();
        var game = getGameByRoomId(gameRoomId);
        var opponent = usersCollection.getByNickname(game.getOpponent(socket.nickname));
        opponent.setHasGame(false);
        io.to(opponent.getId()).emit('opponentHasLeaveGame');
        io.sockets.emit('updatePlayersGameStatus', [
            {
                nickname: user.getNickname(),
                hasGame: user.getHasGame()
            },
            {
                nickname: opponent.getNickname(),
                hasGame: opponent.getHasGame()
            }
        ]);
    });

    socket.on('nextGameRequest', function (isAccept) {
        var user = usersCollection.getByNickname(socket.nickname);
        var gameRoomId = user.getRoomId();
        var game = getGameByRoomId(gameRoomId);

        if (isAccept) {
            if (game.isNextGameAccepted() === null) {
                socket.emit('nextGameResponse', 'waitingForOpponent');
                game.acceptNextGame();
            } else if (game.isNextGameAccepted()) {
                game.resetGame();
                io.to(gameRoomId).emit('nextGameResponse', 'startNewGame', game.getStartGameParameters());
            } else if (!game.isNextGameAccepted()) {
                user.setHasGame(false);
                var opponent = usersCollection.getByNickname(game.getOpponent(socket.nickname));
                opponent.setHasGame(false);
                socket.emit('nextGameResponse', 'opponentNotConfirmNextGame');
                io.sockets.emit('updatePlayersGameStatus', [
                    {
                        nickname: opponent.getNickname(),
                        hasGame: opponent.getHasGame()
                    },
                    {
                        nickname: user.getNickname(),
                        hasGame: user.getHasGame()
                    }
                ]);
            }
        } else {
            user.setHasGame(false);
            var opponent = usersCollection.getByNickname(game.getOpponent(socket.nickname));
            opponent.setHasGame(false);
            io.to(opponent.getId()).emit('nextGameResponse', 'opponentNotConfirmNextGame');
            io.sockets.emit('updatePlayersGameStatus', [
                {
                    nickname: opponent.getNickname(),
                    hasGame: opponent.getHasGame()
                },
                {
                    nickname: user.getNickname(),
                    hasGame: user.getHasGame()
                }
            ]);
        }

    });

    socket.on('timeForMoveHasGone', function () {
        var gameRoomId = usersCollection.getByNickname(socket.nickname).getRoomId();
        var game = getGameByRoomId(gameRoomId);
        game.changeNextMoveUser();
        io.to(gameRoomId).emit('changeNextMoveUser', {
            currentPlayer: game.getCurrentPlayer()
        });
    });

});

var getCurrentTimeAsString = function () {
    var date = new Date();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    hour = hour < 10 ? '0' + hour : hour;
    return hour + ":" + minutes + ":" + seconds;
};

var getGameByRoomId = function (roomId) {
    var result = null;
    games.forEach(function (game) {
        if (game.roomId === roomId) {
            result = game.game;
            return;
        }
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