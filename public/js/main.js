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

$(document).ready(function () {
    (new Forms()).init();
//    TopMenu.init();
//    $("#menu-items-container").load("../views/myAccount.html", function () {
//    });



});

