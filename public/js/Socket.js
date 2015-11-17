
var Socket = function(nickname) {
  this.socket = null;
  this.nickname = nickname;
};

Socket.prototype.connect = function() {
  this.socket = io.connect('http://localhost:8080');  
};

Socket.prototype.getSocket = function() {
    return this.socket;
};

Socket.prototype.listen = function() {
    var self = this;
    
    //Aktualizacja czatu globalnego
    this.socket.on('updateGlobalChat', function (data) {
        $("#global-chat-area").val($("#global-chat-area").val() + '\n' + data.message);
    });
    
        //Odpowiedź na żądanie zalogowania
    this.socket.on('loginResponse', function (data) {
        if (data.isUserExists) {
            alert("Użytkownik o takiej nazwie jest już w systemie");
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
        if (confirm(data.from + " zaprasza cię do gry. Akceptujesz?")) {
            self.socket.emit('inviteResponse', {
                'accept': true,
                'to': data.from
            });
        } else {
            self.socket.emit('inviteResponse', {
                'accept': false,
                'to': data.from
            });
        }
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
        gameArea.drawArea();
    });
};

var enableGameArea = function () {
    $("#global-chat").hide();
    $("#game-area").show();
};

var enableGlobalChat = function () {
    $("#global-chat").show();
    $("#game-area").hide();
};