

var Dialog = {
    existsDialogId: null
};

Dialog.createDialog = function (params) {
    var id = "";
    for (var i = 0; i < 10; i++) {
        id += Math.floor(Math.random(0) * 9);
    }

    this.existsDialogId = id;

    var dialog = $("<div id='" + id + "'></div>");
    dialog.append("<span class='dialog-message'>" + params.message + "</span>");
    var buttonsContainer = $("<div class='dialog-buttons-container'>");

    if (params.buttons !== undefined) {
        params.buttons.forEach(function (button) {
            buttonsContainer.append($("<button>", {
                text: button.text,
                click: function () {
                    button.callback(id);
                }
            }).addClass('dialog-button'));
        });
        dialog.append(buttonsContainer);
    }

    dialog.addClass('dialog');

    $("body").append(dialog);

    return dialog;
};

Dialog.removeExistsDialog = function () {
    if (this.existsDialogId !== null) {
        $("#" + this.existsDialogId).remove();
    }
};