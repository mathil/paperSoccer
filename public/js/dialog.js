
var Dialog = {};

Dialog.showConfirmDialog = function (params) {
    var dialog = $("#confirm-dialog");
    $("#confirm-dialog-message").html(params.message);
    dialog.show();
    $("#confirm-dialog").on('click', '#dialog-confirm-button', function (evt) {
        if (params.confirmCallback !== undefined || params.confirmCallback !== null)
            params.confirmCallback();
        dialog.hide();
        $(this).off(evt);
    });

    $("#confirm-dialog").on('click', '#dialog-cancel-button', function (evt) {
        if (params.cancelCallback !== undefined || params.cancelCallback !== null)
            params.cancelCallback();
        dialog.hide();
        $(this).off(evt);
    });

};

Dialog.showInfoDialog = function (params) {
    var dialog = $("#info-dialog");
    $("#info-dialog-message").html(params.message);
    dialog.show();
    $("#info-dialog").on('click', '#dialog-close-button', function (evt) {
        if (params.closeCallback !== undefined && params.closeCallback !== null)
            params.closeCallback();
        dialog.hide();
        $(this).off(evt);
    });
};