var gameArea = new GameArea();
var SOCKET;
var nickname;

var addListeners = function () {
    $('#login-form-form').submit(function (evt) {
        evt.preventDefault();
        nickname = $("#login").val();
        SOCKET = new Socket(nickname);
        SOCKET.connect();
        SOCKET.listen();
        SOCKET.getSocket().emit('login', {
            nickname: $('#login').val()
        });
    });

    $("#global-chat-send-message").click(function () {
        sendGlobalChatMessage();
    });
    
    $("#global-chat-message").keypress(function(e){
       if(e.which === 13) {
            sendGlobalChatMessage();
       } 
    });

    $("#players-list").on('click', '.player', function () {
        var id = $(this).attr('id');
        if (id !== nickname) {
            SOCKET.getSocket().emit('invite', {
                from: nickname,
                to: id
            });
        }
    });

    $("#game-chat-input-button").click(function () {
        sendGameChatMessage();
    });
    
    $("#game-chat-input").keypress(function(e){
       if(e.which === 13) {
            sendGameChatMessage();
       } 
    });

    function sendGlobalChatMessage() {
        SOCKET.getSocket().emit('globalChatMessage', {
            message: $("#global-chat-message").val()
        });
        $("#global-chat-message").val("");
    }

    function sendGameChatMessage() {
        SOCKET.getSocket().emit('gameChatMessage', {
            message: $("#game-chat-input").val()
        });
        $("#game-chat-input").val("");
    }


};


$(document).ready(function () {
//    enableGameArea();
//    $("#global-chat").show();
//    $("#login-form").hide();
//    gameArea.setBasicParameters({
//        playerA: 'gracz1',
//        playerB: 'gracz2',
//        playerAColorLine: '#fffff',
//        playerBColorLine: '#fffff',
//    });
//    gameArea.initArea();
    addListeners();



});

