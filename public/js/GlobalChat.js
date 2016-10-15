
var GlobalChat = function () {

};

GlobalChat.prototype.load = function () {
    var that = this;
    $("#global-chat-container").css('display', 'block');
    $("#global-chat-container").load('../views/globalChat.html', function () {
        SOCKET.getSocket().emit('getPlayersList', function (players) {
            var content = "";
            (players).forEach(function (player) {
                content += "<button class='player' id='" + player.nickname + "'>" + player.nickname;
                if (player.hasGame) {
                    content += " <img id='" + player.nickname + "_hasGame' src='../img/small_ball.png'/>";
                } else {
                    content += " <img id='" + player.nickname + "_hasGame' src='../img/small_ball.png' style='display: none;'/>";
                }
                content += "</button>";
            });
            $("#players").html(content);
            $("#" + nickname).css('font-weight', 'bold');
            that.initGameInviteListener(nickname);
            that.initInputListener();
        });
    });
};

GlobalChat.prototype.initGameInviteListener = function () {
    $("#players-list").on('click', '.player', function () {
        var id = $(this).attr('id');
        if (id !== nickname) {
            var waitingDialog = Dialog.createDialog({
                message: "Oczeniwanie na akceptacje przeciwnika...",
            });
            SOCKET.getSocket().emit('invite', id, function (responseMsg) {
                Dialog.removeExistsDialog();
                if (responseMsg === 'opponentHasGame') {
                    Dialog.createDialog({
                        message: "Gracz aktualnie prowadzi rozgrywkę",
                        buttons: [
                            {
                                text: "Zamknij",
                                callback: function (dialogId) {
                                    $("#" + dialogId).remove();
                                }
                            }
                        ]
                    });
                } else if (responseMsg === 'refused') {
                    Dialog.createDialog({
                                message: "Gracz odrzucił zaproszenie",
                        buttons: [
                            {
                                text: "Zaloguj",
                                callback: function (dialogId) {
                                    $("#" + dialogId).remove();
                                }
                            }
                        ]
                    });
                }
            });
        }
    });
};

GlobalChat.prototype.initInputListener = function () {
    $("#global-chat-send-message").click(function () {
        sendGlobalChatMessage();
    });

    $("#global-chat-message").keypress(function (e) {
        if (e.which === 13) {
            sendGlobalChatMessage();
        }
    });

    function sendGlobalChatMessage() {
        SOCKET.getSocket().emit('globalChatMessage', {
            message: $("#global-chat-message").val()
        });
        $("#global-chat-message").val("");
    }

};

GlobalChat.prototype.destroy = function () {
    $("#global-chat").remove();
};