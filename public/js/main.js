var SOCKET;
var nickname;

var showGlobalChatAndRemoveGameArea = function () {
    $("#global-chat-container").css('display', 'block');
    $("#container").css('display', 'none');
    $("#game-area").remove();
};

var hideGlobalChat = function() {
    $("#global-chat-container").css('display', 'none');
};

$(document).ready(function () {
    (new Forms()).init();
    
//

//        Dialog.createDialog({
//            'message' : "test",
//            buttons: [
//                {
//                    text: 'tak'
//                },
//                {
//                    text: 'tak'
//                }
//            ]
//        })



});

