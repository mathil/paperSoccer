
var Socket = function (nickname) {
    console.log('socket.nickname=' + nickname);
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

    //Nowe zaproszenie od użytkownika
    this.socket.on('inviteRequest', function (from) {
        Dialog.createDialog({
            message: from + " zaprasza cię do gry. Akceptujesz?",
            buttons: [
                {
                    text: "Akceptuj",
                    callback: function (dialogId) {
                        that.socket.emit('inviteResponse', true, from);
                        $("#" + dialogId).remove();
                    }
                },
                {
                    text: "Odrzuć",
                    callback: function (dialogId) {
                        that.socket.emit('inviteResponse', false, from);
                        $("#" + dialogId).remove();
                    }
                }
            ]
        });
    });

    //Obsługa zdarzenia usunięcia użytkownika
    this.socket.on('removeFromPlayersList', function (data) {
        $("#" + data.nickname).remove();
    });

    //Dodanie do listy nowego użytkownika
    this.socket.on('addToPlayersList', function (data) {
        if (data.nickname !== that.nickname) {
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
        Dialog.removeExistsDialog();
        $("#global-chat").hide();
        $("#container").load("../views/game.html", function () {
            gameArea = new GameArea();
            gameArea.init(data.gameParams);
            console.log(that.nickname);
            console.log(data.gameParams.currentPlayer);
            if (that.nickname === data.gameParams.currentPlayer) {
                gameArea.unlockArea();
            } else {
                gameArea.lockArea();
            }
            gameArea.initGameAreaListeners();
            gameArea.setMoveIcon(data.gameParams.currentPlayer);

        });
    });

    this.socket.on('stopGame', function (data) {
        Dialog.createDialog({
            message: data.nickname + " opuścił grę",
            buttons: [
                {
                    text: "Zamknij",
                    callback: function (dialogId) {
                        showGlobalChatAndRemoveGameArea();
                        $("#" + dialogId).remove();
                    }
                }
            ]
        })
    });

    this.socket.on('validateResponse', function (data) {
        console.log(data);

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
                                showGlobalChatAndRemoveGameArea();
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
                                showGlobalChatAndRemoveGameArea();
                                that.socket.emit('nextGameRequest', false);
                                $("#" + dialogId).remove();
                            }
                        }
                    ]
                });
            } else if (data.status === 'continueGame') {
                if (data.currentPlayer === that.nickname) {
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
                        showGlobalChatAndRemoveGameArea();
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
            if (player.hasGame) {
                $("#" + player.nickname + "_hasGame").show();
            } else {
                $("#" + player.nickname + "_hasGame").hide();
            }
        });
    });

    this.socket.on('changeNextMoveUser', function (data) {
        if (that.nickname === data.currentPlayer) {
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
        if (responseStatus === 'waitingForOpponent') {
            Dialog.createDialog({
                message: "Oczekiwanie na akceptacje przeciwnika",
            });
        } else if (responseStatus === 'startNewGame') {
            Dialog.removeExistsDialog();
            gameArea.startNewGame(params);
            if (params.currentPlayer === that.nickname) {
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
                            showGlobalChatAndRemoveGameArea();
                            $("#" + dialogId).remove();
                        }
                    }
                ]
            });
        }
    });

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