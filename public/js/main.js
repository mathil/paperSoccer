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
        SOCKET.getSocket().emit('globalChatMessage', {
            message: $("#global-chat-message").val()
        });
        $("#global-chat-message").val("");
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
    
    $("#game-chat-input-button").click(function() {
        var message = $("#game-chat-input").val();
        $("#game-chat-input").val("");
        
        SOCKET.getSocket().emit('gameChatMessage', {
            message: message
        });
    });
    
    $("#show-dialog").click(function() {
        Dialog.showConfirmDialog({
            message: "To jest test dialogu",
            confirmCallback: function() {
                //console.log("confirm");
            },
            cancelCallback: function() {
                //console.log("close");
            }
        });
    });
    
    
};


$(document).ready(function () {
//    enableGameArea();
//    $("#global-chat").show();
//    enableGameArea();
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

