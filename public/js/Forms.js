var that;

var Forms = function () {
    that = this;
};


Forms.prototype.showLoginForm = function () {
    $("#content").load("../views/login.ejs", function () {
        $('#login-form-form').submit(function (evt) {
            evt.preventDefault();
            SOCKET = new Socket(nickname);
            SOCKET.connect();
            var nickname = $("#login").val();
            var password = $("#password").val();
            SOCKET.listen();
            SOCKET.getSocket().emit('login', nickname, password, function (loginIsValid, loggedUsers) {
                if (loginIsValid) {
                    this.nickname = $("#login").val();
                    $("#login-form").remove();
                    $("#global-chat").show();
                    var content = "";
                    (loggedUsers).forEach(function (player) {
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
    $("#content").load("../views/registration.ejs", function () {
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