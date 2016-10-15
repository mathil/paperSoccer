var that;
var Forms = function () {
    that = this;
};


Forms.prototype.showLoginForm = function () {
    sessionStorage.setItem('logged', 'false');
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
                        Dialog.showInfoDialog("Użytkownik o takim loginie jest już zalogowany");
                        SOCKET.getSocket().disconnect();
                        return;
                    }

                    sessionStorage.setItem('logged', 'true');

                    $("#login-form").remove();
                    TopMenu.init();
                    (new GlobalChat()).load();
                } else {
                    Dialog.showInfoDialog("Nieprawidłowy login lub hasło");
                    SOCKET.getSocket().disconnect();
                }
            });
        });

        $("#show-registration-form").click(function () {
            that.showRegistrationForm();
//            $("#login-form").remove();
        });

        $("#reset-password-button").on('click', function () {
            that.showResetPasswordForm();
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

            var tempSocket = new Socket();
            tempSocket.connect();
            tempSocket.getSocket().emit('registration', formData, function (response, invalidMessage) {
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
                   Dialog.showInfoDialog(invalidMessage);
                   SOCKET.getSocket().disconnect();
                }
            });
        });
        $("#show-login-form").click(function () {
            that.showLoginForm();
        });
    });
};

Forms.prototype.showResetPasswordForm = function () {
    $("#container").load("../views/resetPassword.html", function () {
        $("#reset-password-form").on('submit', function (evt) {
            evt.preventDefault();

            var email = $("#reset-password-email").val();

            if (!/\S+@\S+\.\S+/.test(email)) {
                Dialog.showInfoDialog("Nieprawidłowy format adresu email");
                return;
            }


            var tempSocket = new Socket();
            tempSocket.connect();
            tempSocket.getSocket().emit('resetPassword', email, function (status) {
                tempSocket = null;
                if (status === 'success') {
                    Dialog.showInfoDialog("Nowe hasło zostało wysłane na podany adres");
                } else if (status === 'error') {
                    Dialog.showInfoDialog("Wystąpił błąd podczas generowania nowego hasła.");
                } else if (status === 'emailNotExists') {
                    Dialog.showInfoDialog("W systemie nie istnieje użytkownik z takim adresem email");
                }
            });

        });



        $("#show-login-form").click(function () {
            that.showLoginForm();
        });
    });
};


Forms.prototype.init = function () {
    this.showLoginForm();
};