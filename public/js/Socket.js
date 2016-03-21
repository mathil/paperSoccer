
var Socket = function (nickname) {
    this.socket = null;
    this.nickname = nickname;
};

Socket.prototype.connect = function () {
    this.socket = io.connect('http://localhost:8080');
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
                content += "<button class='player' id='" + player.nickname + "'>" + player.nickname + "</button>";
            });
            $("#players").html(content);
        }
    });

    //Nowe zaproszenie od użytkownika
    this.socket.on('newInvite', function (data) {
        showConfirmDialog({
            message: data.from + " zaprasza cię do gry. Akceptujesz?",
            confirmCallback: function () {
                that.socket.emit('inviteResponse', {
                    'accept': true,
                    'to': data.from
                });
            },
            cancelCallback: function () {
                that.socket.emit('inviteResponse', {
                    'accept': false,
                    'to': data.from
                });
            }
        });
    });

    //Obsługa zdarzenia usunięcia użytkownika
    this.socket.on('removeFromPlayersList', function (data) {
        $("#" + data.nickname).remove();
    });

    //Dodanie do listy nowego użytkownika
    this.socket.on('addToPlayersList', function (data) {
        if (data.nickname !== nickname) {
            var elem = $("<button class='player' id='" + data.nickname + "'>" + data.nickname + "</button>");
            $("#players").append(elem);
        }
    });


    //Gracz odrzucił zaproszenie do gry
    this.socket.on('inviteRefused', function (data) {
        alert("Użytkownik odrzucił zaproszenie");
    });


    this.socket.on('startGame', function (data) {
        console.log(JSON.stringify(data));
        enableGameArea();
        gameArea.init(data.gameParams);
        console.log('nickname ' + nickname);
        console.log('data.gameParams.unlockedUser ' + data.gameParams.unlockedUser);
        if (nickname === data.gameParams.hasMove) {
            console.log('unlockarea');
            gameArea.unlockArea();
        } else {
            console.log('lockarea');
            gameArea.lockArea();
        }
        gameArea.initArea();
    });

    this.socket.on('stopGame', function (data) {
        alert(data.nickname + " opuścił grę");
        disableGameArea();
    });

    this.socket.on('validateResponse', function (data) {

        if (!data.isValid)
            return;

        gameArea.drawMove(data.x, data.y, data.lineColor);

        if (data.isGoalMove) {
            gameArea.isGoalMove(data.goalFor, data.score, data.resetGameParams);
        }
        if (data.hasMove === this.nickname) {
            gameArea.unlockArea();
        } else {
            gameArea.lockArea();
        }
        gameArea.setMoveIcon(data.hasMove);
    });

    this.socket.on('updateGameChat', function (data) {
        $("#game-chat").val($("#game-chat").val() + '\n' + data.message);
    });

    this.socket.on('opponentHasLeaveGame', function () {
        alert('przeciwnik opuścił grę');
        disableGameArea();
        enableGlobalChat();
    });
    
    this.socket.on('nextGameRequest', function(data) {
       alert(data.status);
    });

};

var enableGameArea = function () {
    $("#global-chat").hide();
    $("#game-area").show();
};

var disableGameArea = function () {
    $("#global-chat").show();
    $("#game-area").hide();

}

var enableGlobalChat = function () {
    $("#global-chat").show();
    $("#game-area").hide();
};