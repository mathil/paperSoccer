
var showConfirmDialog = function(params) {
    var dialog = $("#dialog");
    $("#dialog-message").html(params.message);
    dialog.show();
    
    $("#dialog").on('click', '#dialog-confirm-button', function(){
        params.confirmCallback();
        dialog.hide();
    });
    
    $("#dialog").on('click', '#dialog-cancel-button', function(){
        params.cancelCallback();
        dialog.hide();
    });
};

var showInfoDialog = function(params) {
    
    $("#dialog").on('click', '#dialog-close-button', function(){
        params.cancelCallback();
        dialog.hide();
    });
};


