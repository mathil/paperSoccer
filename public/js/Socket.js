
var Socket = function (nickname) {
    this.socket = null;
    this.nickname = nickname;
};

Socket.prototype.connect = function () {
    this.socket = io.connect('http://192.168.1.16:8080');
};

Socket.prototype.getSocket = function () {
    return this.socket;
};

Socket.prototype.listen = function () {
    var that = this;

    //Aktualizacja czatu globalnego
    this.socket.on('updateGlobalChat', function (data) {
        $("#global-chat-area").val($("#global-chat-area").val() + '\n' + data.message);
    });

    //Odpowiedź na żądanie zalogowania
    this.socket.on('loginResponse', function (data) {
        if (data.isUserExists) {
            $("#login-message").html("Użytkownik o takiej nazwie jest już w systemie");
//            that.socket.disconnected();
        } else {
            this.nickname = $("#login").val();
            $("#login-form").hide();
            $("#global-chat").show();
            var content = "";
            (data.players).forEach(function (player) {
                content += "<button class='player' id='" + player.nickname + "'>" + player.nickname;
                if (player.hasGame) {
                    content += " <img id='" + player.nickname + "_hasGame' src='../img/small_ball.png'/>";
                } else {
                    content += " <img id='" + player.nickname + "_hasGame' src='../img/small_ball.png' style='display: none;'/>";
                }
                content += "</button>";
            });
            $("#players").html(content);
        }
    });

    //Nowe zaproszenie od użytkownika
    this.socket.on('newInvite', function (data) {
        Dialog.createDialog({
            message: data.from + " zaprasza cię do gry. Akceptujesz?",
            buttons: [
                {
                    text: "Akceptuj",
                    callback: function (dialogId) {
                        that.socket.emit('inviteResponse', {
                            'accept': true,
                            'to': data.from
                        });
                        $("#" + dialogId).remove();
                    }
                },
                {
                    text: "Odrzuć",
                    callback: function (dialogId) {
                        that.socket.emit('inviteResponse', {
                            'accept': false,
                            'to': data.from
                        });
                        $("#" + dialogId).remove();
                    }
                }
            ]
        })
    });

    //Obsługa zdarzenia usunięcia użytkownika
    this.socket.on('removeFromPlayersList', function (data) {
        $("#" + data.nickname).remove();
    });

    //Dodanie do listy nowego użytkownika
    this.socket.on('addToPlayersList', function (data) {
        if (data.nickname !== nickname) {


            var elem = $("<button class='player' id='" + data.nickname + "'>" +
                    data.nickname +
                    "<img id='" + data.nickname + "_hasGame' src='../img/small_ball.png' style='display: none' />" +
                    "</button>");
            $("#players").append(elem);
        }
    });


    //Gracz odrzucił zaproszenie do gry
    this.socket.on('inviteRefused', function (data) {
        Dialog.createDialog({
            message: "Przeciwnik odrzucił zaproszenie",
            buttons: [
                {
                    text: "Zamknij",
                    callback: function (dialogId) {
                        $("#" + dialogId).remove();
                    }
                }
            ]
        });
    });


    this.socket.on('startGame', function (data) {
        //console.log(JSON.stringify(data));
        enableGameArea();
        gameArea.init(data.gameParams);
        //console.log('nickname ' + nickname);
        //console.log('data.gameParams.unlockedUser ' + data.gameParams.unlockedUser);
        if (nickname === data.gameParams.currentPlayer) {
            //console.log('unlockarea');
            gameArea.unlockArea();
        } else {
            //console.log('lockarea');
            gameArea.lockArea();
        }
        gameArea.initArea();
        gameArea.setMoveIcon(data.gameParams.currentPlayer);
    });

    this.socket.on('stopGame', function (data) {
        Dialog.createDialog({
            message: data.nickname + " opuścił grę",
            buttons: [
                {
                    text: "Zamknij",
                    callback: function (dialogId) {
                        $("#" + dialogId).remove();
                    }
                }
            ]
        })
    });

    this.socket.on('validateResponse', function (data) {

        if (data.status !== 'invalidMove') {
            gameArea.drawMove(data.x, data.y, data.lineColor);
            if (data.status === 'goalMove') {
                gameArea.stopTimer();
                gameArea.isGoalMove(data.winner, data.score, data.resetGameParams);
                gameArea.lockArea();
                Dialog.createDialog({
                    message: "Gooool! " + data.winner + " wygrywa mecz! Czy chcesz zagrać rewanż?",
                    buttons: [
                        {
                            text: "Zagraj",
                            callback: function (dialogId) {
                                that.socket.emit('nextGameRequest', true);
                                $("#" + dialogId).remove();
                            }
                        },
                        {
                            text: "Odrzuć",
                            callback: function (dialogId) {
                                disableGameArea();
                                enableGlobalChat();
                                that.socket.emit('nextGameRequest', false);
                                $("#" + dialogId).remove();
                            }
                        }
                    ]
                });
            } else if (data.status === 'moveNotAvailable') {
                gameArea.stopTimer();
                gameArea.lockArea();
                gameArea.isGoalMove(data.winner, data.score, data.resetGameParams);
                Dialog.createDialog({
                    message: "Brak możliwości ruchu! " + data.winner + " wygrywa mecz! Czy chcesz zagrać rewanż?",
                    buttons: [
                        {
                            text: "Zagraj",
                            callback: function (dialogId) {
                                that.socket.emit('nextGameRequest', true);
                                $("#" + dialogId).remove();

                            }
                        },
                        {
                            text: "Odrzuć",
                            callback: function (dialogId) {
                                disableGameArea();
                                enableGlobalChat();
                                that.socket.emit('nextGameRequest', false);
                                $("#" + dialogId).remove();
                            }
                        }
                    ]
                });
            } else if (data.status === 'continueGame') {
                if (data.currentPlayer === this.nickname) {
                    gameArea.unlockArea();
                } else {
                    gameArea.lockArea();
                }
                gameArea.setMoveIcon(data.currentPlayer);
                gameArea.resetTimeForMove();
            }
        }

    });

    this.socket.on('updateGameChat', function (data) {
        $("#game-chat").val($("#game-chat").val() + '\n' + data.message);
    });

    this.socket.on('opponentHasLeaveGame', function () {
        Dialog.createDialog({
            message: "Przeciwnik opuścił grę",
            buttons: [
                {
                    text: "Zamknij",
                    callback: function (dialogId) {
                        disableGameArea();
                        enableGlobalChat();
                        $("#" + dialogId).remove();
                    }
                }
            ]
        });
    });

    this.socket.on('nextGameRequest', function (data) {
        alert(data.status);
    });

    this.socket.on('receiverHasGame', function (data) {
        Dialog.createDialog({
            message: "Użytkownik aktualnie rozgrywa mecz",
            buttons: [
                {
                    text: "Zamknij",
                    callback: function (dialogId) {
                        $("#" + dialogId).remove();
                    }
                }
            ]
        });
    });

    this.socket.on('updatePlayersGameStatus', function (players) {
        players.forEach(function (player) {
            //console.log('player: ' + player.nickname);
            //console.log('hasgame: ' + player.hasGame);
            if (player.hasGame) {
                $("#" + player.nickname + "_hasGame").show();
            } else {
                $("#" + player.nickname + "_hasGame").hide();
            }
        });
    });

    this.socket.on('changeNextMoveUser', function (data) {
        console.log('changeNextMoveUser');
        if (nickname === data.currentPlayer) {
            gameArea.unlockArea();
        } else {
            gameArea.lockArea();
        }
        gameArea.setMoveIcon(data.currentPlayer);
        gameArea.resetTimeForMove();
    });

    this.socket.on('disconnect', function (data, params) {
    });

    this.socket.on('nextGameResponse', function (responseStatus, params) {
        console.log(responseStatus);
        if (responseStatus === 'waitingForOpponent') {
            Dialog.createDialog({
                message: "Oczekiwanie na akceptacje przeciwnika",
            });
        } else if (responseStatus === 'startNewGame') {
            Dialog.removeExistsDialog();
            gameArea.startNewGame(params);
            if (params.currentPlayer === nickname) {
                gameArea.unlockArea();
            }
        } else if (responseStatus === 'opponentNotConfirmNextGame') {
            Dialog.removeExistsDialog();
            Dialog.createDialog({
                message: "Przeciwnik nie zaakceptował kolejnego meczu",
                buttons: [
                    {
                        text: "Zamknij",
                        callback: function (dialogId) {
                            disableGameArea();
                            $("#" + dialogId).remove();
                        }
                    }
                ]
            });



        } else {
            //TO DO
        }
    });

};

var enableGameArea = function () {
    $("#global-chat").hide();
    $("#game-area").show();
};

var disableGameArea = function () {
    //console.log('disableGameArea');
    $("#global-chat").show();
    $("#game-area").hide();

}

var enableGlobalChat = function () {
    //console.log('enableGlobalChat');
    $("#global-chat").show();
    $("#game-area").hide();
};

var addPlayerToList = function (nickname, hasGame) {
    var elem = null;
    if (hasGame) {
        elem = $("<button class='player' id='" + nickname + "'>" + nickname + "</button>");
    } else {
        elem = $("<button class='player' id='" + nickname + "'>" + nickname + "</button>");
    }
    $("#players").append(elem);
};