var core = new Core();
var socket;


var addListeners = function () {
    $('#login-form-form').submit(function (evt) {
        console.log('submit');
        evt.preventDefault();
        nickname = $("#login").val();
        socket = new Socket(nickname);
        socket.connect();
        socket.listen();
        socket.getSocket().emit('login', {
            nickname: $('#login').val()
        });
    });

    $("#global-chat-send-message").click(function () {
        socket.getSocket().emit('globalChatMessage', {
            message: $("#global-chat-message").val()
        });
        $("#global-chat-message").val("");
    });

    $("#players-list").on('click', '.player', function () {
        var id = $(this).attr('id');
        socket.getSocket().emit('invite', {
            from: nickname,
            to: id
        });
    });
}

addListeners();

