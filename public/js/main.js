var gameArea = new GameArea();
var SOCKET;
var nickname;

var addListeners = function () {
    $("#global-chat-send-message").click(function () {
        sendGlobalChatMessage();
    });

    $("#global-chat-message").keypress(function (e) {
        if (e.which === 13) {
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

    $("#game-chat-input").keypress(function (e) {
        if (e.which === 13) {
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
    addListeners();
    (new Forms()).init();
});

