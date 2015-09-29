$(document).ready(function () {

    var socket = new Socket();
    var nickname = "";

    //Odpowiedź na żądanie zalogowania
    socket.on('loginResponse', function (data) {
        console.log('ifUserExists ' + data.isUserExists);
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

    //Aktualizacja czatu globalnego
    socket.on('updateGlobalChat', function (data) {
        $("#global-chat-area").val($("#global-chat-area").val() + '\n' + data.message);
    });

    //Nowe zaproszenie od użytkownika
    socket.on('newInvite', function (data) {
        if (confirm(data.from + " zaprasza cię do gry. Akceptujesz?")) {

            socket.emit('inviteResponse', {
                'accept': true,
                'to': data.from
            });
            enableGameArea();
            $("#score").html(this.nickname + " 0 : 0 " + data.from);

        } else {

            socket.emit('inviteResponse', {
                'accept': false,
                'to': data.from
            });

        }
    });

    //Obsługa zdarzenia usunięcia użytkownika
    socket.on('removeFromPlayersList', function (data) {
        console.log('usuwam ' + data.nickname);
        $("#" + data.nickname).remove();
    });

    //Dodanie do listy nowego użytkownika
    socket.on('addToPlayersList', function (data) {
        console.log('addToPlayersList');
        if (data.nickname !== nickname) {
            var elem = $("<button class='player' id='" + data.nickname + "'>" + data.nickname + "</button>");
            $("#players").append(elem);
        }
    });


    //Odpowiedź na wysłane zaproszenie do gry
    socket.on('inviteResponse', function (data) {
        if (data.response) {
            enableGameArea();
            console.log('game');
            $("#score").html(this.nickname + " 0 : 0 " + data.from);

        } else {
            alert("Użytkownik odrzucił zaproszenie");
        }
    });


    $('#login-form-form').submit(function (evt) {
        evt.preventDefault();
        nickname = $("#login").val();
        socket.emit('login', {
            nickname: $('#login').val()
        });
    });

    $("#global-chat-send-message").click(function () {
        socket.emit('globalChatMessage', {
            message: $("#global-chat-message").val()
        })
        $("#global-chat-message").val("");
    });

    $("#players-list").on('click', '.player', function () {
        var id = $(this).attr('id');
        socket.emit('invite', {
            from: nickname,
            to: id
        });
    });



});


var enableGameArea = function () {
    $("#game-area").show();
    $("#global-chat").hide();
};