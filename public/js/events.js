$(document).ready(function () {


//    $("#login-form").hide();
//    $("#game-area").show();

    var socket = new Socket();
    var nickname = "";


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

    socket.on('updateGlobalChat', function (data) {
        $("#global-chat-area").val($("#global-chat-area").val() + '\n' + data.message);
    });



    socket.on('newInvite', function (data) {
        if (confirm(data.from + " zaprasza cię do gry. Akceptujesz?")) {

            socket.emit('inviteResponse', {
                'accept': true,
                'to': data.from
            });

            $("#global-chat").hide();
            $("#game-area").show();


        } else {

            socket.emit('inviteResponse', {
                'accept': false,
                'to': data.from
            });

        }
    });
    
    socket.on('removeFromPlayersList', function(data){
        console.log('usuwam ' + data.nickname);
        $("#"+data.nickname).remove();
    });
    
    socket.on('addToPlayersList', function(data){
        console.log('addToPlayersList');
        if(data.nickname !== nickname) {
            var elem = $("<button class='player' id='" + data.nickname + "'>" + data.nickname + "</button>");
            $("#players").append(elem);
        }
    });
    
    

    socket.on('inviteResponse', function (data) {
        alert(data.response);
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
