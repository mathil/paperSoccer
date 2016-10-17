// server.js
var express = require('express');
var app = express();
var port = 8080;

var gameContainer = [];

app.set('view engine', 'html');

var mailer = require('./serverScripts/Mailer.js');
var Game = require('./serverScripts/Game.js');
var User = require('./serverScripts/User.js');
var UsersCollection = require('./serverScripts/UsersCollection.js');
var QueryManager = require('./serverScripts/QueryManager.js');

var usersCollection = new UsersCollection();
var queryManager = new QueryManager();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/lib'));


//queryManager.updateScore("asd", "qwe");


// index    
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});

var io = require('socket.io').listen(app.listen(port));
console.log('Serwer nasłuchuje na porcie ' + port);

io.sockets.on('connection', function (socket) {
    //Mechanizm logowania do gry
    socket.on('login', function (nickname, password, loginResponse) {
        queryManager.checkLogin(nickname, password, function (result) {
            if (result) {
                if (usersCollection.isExists(nickname)) {
                    loginResponse(result, true);
                } else {
                    socket.nickname = nickname;
                    usersCollection.add(new User(nickname, socket.id));
                    console.log(nickname + " zalogował się. Liczba użytkowników - " + usersCollection.getSize());
                    io.sockets.emit('addToPlayersList', {
                        nickname: socket.nickname
                    });
                    loginResponse(result, false);

                }
            } else {
                loginResponse(result, false);
            }
        });
    });

    //Rejestracja nowego użytkownika
    socket.on('registration', function (formData, registrationResponse) {
        queryManager.checkIfUserExists(formData.nick, formData.email, function (isExists) {
            if (!isExists) {
                if (formData.password !== formData.passwordConfirm) {
                    registrationResponse(false, "Podane hasła nie są takie same");
                } else {
                    queryManager.insertUser(formData.nick, formData.email, formData.password, function (success) {
                        if (success) {
                            mailer.sendRegistrationMail(formData.nick, formData.email)
                            registrationResponse(true, null);
                        } else {
                            console.log('tutaj');
                            registrationResponse(false, "Wystąpił błąd podczas tworzenia konta.");
                        }
                    });
                }
            } else {
                registrationResponse(false, "W systemie istnieje użytkownik o takim loginie lub adresie email");
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
    socket.on('invite', function (opponentNickname, callback) {
        console.log("Zaproszenie do gry od " + socket.nickname + " dla " + opponentNickname);
        var opponent = usersCollection.getByNickname(opponentNickname);
        if (opponent.getHasGame()) {
            callback('opponentHasGame');
        } else {
            io.to(opponent.getId()).emit('inviteRequest', socket.nickname);
        }
    });

    //Odpowiedź na zaproszenie do gry
    socket.on('inviteResponse', function (accept, nickname) {
        var opponent = usersCollection.getByNickname(nickname);
        var user = usersCollection.getByNickname(socket.nickname);
        if (accept) {
            var roomId = generateRandomString(10);
            var game = new Game(socket.nickname, opponent.getNickname(), roomId);

            gameContainer.push({roomId: roomId, game: game});

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

        if (validateResponse.status === 'goalMove') {
            queryManager.updateScore(validateResponse.winner, validateResponse.loser);
        }


        io.to(gameRoomId).emit('validateResponse', validateResponse);

    });

    socket.on('leaveGame', function () {
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

    socket.on('getPlayersList', function (callback) {
        callback(usersCollection.getList());
    });

    socket.on('getScoreList', function (callback) {
        queryManager.getScoreForAllUsers(function (result) {
            callback(result);
        });
    });

    socket.on('getUserProperties', function (callback) {
        queryManager.getUserProperties(socket.nickname, function (result) {
            callback(result);
        });
    });

    socket.on('changePassword', function (currentPassword, newPassword, callback) {
        queryManager.changePassword(socket.nickname, currentPassword, newPassword, function (result) {
            callback(result);
        });
    });

    socket.on('changeEmail', function (email, callback) {
        queryManager.changeEmail(socket.nickname, email, function (result) {
            callback(result);
        });
    });

    socket.on('resetPassword', function (email, callback) {
        var newPassword = generateRandomString(7);
        queryManager.resetPassword(email, newPassword, function (nickname) {
            if (nickname && nickname !== null) {
                mailer.sendNewPassword(nickname, newPassword, email, function (success) {
                    if (success) {
                        callback("success");
                    } else {
                        callback("error");
                    }
                });
            } else {
                callback("emailNotExists");
            }
        });
    });

});

var getCurrentTimeAsString = function () {
    var date = new Date();
    return ('00' + date.getHours()).slice(-2) + 
            ":" + ('00' + date.getMinutes()).slice(-2) + 
            ":" + ('00' + date.getSeconds()).slice(-2);
};

var getGameByRoomId = function (roomId) {
    var result = null;
    gameContainer.forEach(function (game) {
        if (game.roomId === roomId) {
            result = game.game;
            return;
        }
    });
    return result;
};



var generateRandomString = function (length) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var id = "";
    for (var i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};
