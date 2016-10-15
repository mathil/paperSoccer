var nickname;

var showGlobalChatAndRemoveGameArea = function () {
    $("#global-chat-container").css('display', 'block');
    $("#container").empty();
    gameArea.stopTimer();
    gameArea = null;
};

var hideGlobalChat = function () {
    $("#global-chat-container").css('display', 'none');
};


$(window).bind('beforeunload', function (evt) {
    if (sessionStorage.getItem('logged') === 'true') {
        return evt;
    }
});
$(document).ready(function () {
    (new Forms()).init();

//    $("#container").load("../views/game.html");

});

