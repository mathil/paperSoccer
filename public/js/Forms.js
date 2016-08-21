var that;
var Forms = function () {
    that = this;
};


Forms.prototype.showLoginForm = function () {
    $("#container").load("../views/login.html", function () {
        $('#login-form-form').submit(function (evt) {
            evt.preventDefault();
            nickname = $("#login").val();
            var password = $("#password").val();
            SOCKET = new Socket(nickname);
            SOCKET.connect();
            SOCKET.listen();
            SOCKET.getSocket().emit('login', nickname, password, function (loginIsValid, userIsLogged) {
                if (loginIsValid) {
                    if (userIsLogged) {
                        $("#login-message").html("Użytkownik o takim loginie jest już zalogowany");
                        return;
                    }

                    sessionStorage.setItem('nickname', nickname);

                    $("#login-form").remove();
                    TopMenu.init();
                    (new GlobalChat()).load();
                } else {
                    $("#login-message").html("Nieprawidłowy login lub hasło");
                }
            });
        });

        $("#show-registration-form").click(function () {
            that.showRegistrationForm();
            $("#login-form").remove();
        });
    });
};

Forms.prototype.showRegistrationForm = function () {
    $("#container").load("../views/registration.html", function () {
        $("#registration-form-form").on('submit', function (evt) {
            evt.preventDefault();
            var formData = {
                nick: $("#registration-nick").val(),
                email: $("#registration-email").val(),
                password: $("#registration-password").val(),
                passwordConfirm: $("#registration-password-confirm").val()
            };

            SOCKET = new Socket('asd');
            SOCKET.connect();
            SOCKET.getSocket().emit('registration', formData, function (response, invalidMessage) {
                if (response) {
                    Dialog.createDialog({
                        message: "Konto zostało założone. Możesz się zalogować",
                        buttons: [
                            {
                                text: "Zaloguj",
                                callback: function (dialogId) {
                                    that.showLoginForm();
                                    $("#registration-form").remove();
                                    $("#" + dialogId).remove();
                                }
                            }
                        ]
                    });
                } else {
                    $("#registration-invalid-message").html(invalidMessage);
                }
            });
        });
        $("#show-login-form").click(function () {
            that.showLoginForm();
            $("#registration-form").remove();
        });
    });
};

Forms.prototype.init = function () {
    this.showLoginForm();
};