
var TopMenu = {
    isRankingActive: false,
    isMyAccountActive: false
};


TopMenu.showRanking = function () {
    this.isMyAccountActive = false;
    var that = this;
    $("#menu-items-container").load("../views/ranking.html", function () {
        $("#close-ranking").on('click', function () {
            that.isRankingActive = false;
            TopMenu.hideRanking();
        });
        SOCKET.getSocket().emit('getRanking', function (data) {
            var index = 0;
//            for (var i = 0; i < 100; i++) {
            data.forEach(function (item) {
                $("#ranking-table tr:last").after(
                        "<tr>" +
                        "<td>" + (++index) + "</td>" +
                        "<td>" + item.nickname + "</td>" +
                        "<td>" + item.score + "</td>" +
                        "<td>" + item.won_matches + "</td>" +
                        "<td>" + item.lost_matches + "</td>" +
                        "<td>" + (item.luck > 0 ? "+" : "") + item.luck + "</td>" +
                        "</tr>"
                        );
            });
//            }
        });
    });
};

TopMenu.hideRanking = function () {
    $("#ranking").remove();
};

TopMenu.showMyAccount = function () {
    this.isRankingActive = false;
    var that = this;
    $("#menu-items-container").load("../views/myAccount.html", function () {
        $("#close-ranking").on('click', function () {
            that.isMyAccountActive = false;
            TopMenu.hideMyAccount();
        });
        SOCKET.getSocket().emit('getUserProperties', function (data) {
            $("#my-nickname").val(data.properties.nickname);
            $("#my-email").val(data.properties.email);
            $("#my-won-matches").val(data.properties.won_matches);
            $("#my-lost-matches").val(data.properties.lost_matches);
            $("#my-luck").val(data.properties.luck);
            var opponent = "";
            var result = "";
            data.gameHistory.forEach(function (item) {

                if (item.loser === nickname) {
                    opponent = item.winner;
                    result = "Przegrana";
                } else {
                    opponent = item.loser;
                    result = "Wygrana";
                }

                $("#my-history-table tr:last").after(
                        "<tr>" +
                        "<td>" + opponent + "</td>" +
                        "<td>" + result + "</td>" +
                        "<td>" + item.datetime + "</td>" +
                        "</tr>"
                        );
            });


        });
        TopMenu.addMyAccountListeners();
    });
};

TopMenu.addMyAccountListeners = function () {
    var isEmailBlock = true;
    var that = this;
    $("#show-change-password-form").on('click', function () {
        $("#change-password-table").toggle();
    });

    $("#change-password-form").on('submit', function (evt) {
        evt.preventDefault();
        var currentPassword = $("#current-password").val();
        var newPassword = $("#new-password").val();
        var newPasswordRepeated = $("#new-password-confirmed").val();
        if (newPassword !== newPasswordRepeated) {
            Dialog.showInfoDialog("Wpisane hasła różnią się od siebie");
            return;
        }

        SOCKET.getSocket().emit('changePassword', currentPassword, newPassword, function (success) {
            if (success === 'success') {
                Dialog.showInfoDialog("Hasło zostało zmienione");
                $("#change-password-table").toggle();
            } else if (success === 'error') {
                Dialog.showInfoDialog("Wystąpił problem podczas zmiany hasła");
            } else if (success === 'currentPasswordNotMatch') {
                Dialog.showInfoDialog("Wpisane hasło jest nieprawidłowe");
            }
        });
    });

    $("#change-email").on('click', function () {
        if (isEmailBlock) {
            $(this).text("zapisz");
            $("#my-email").attr('readonly', false);
            $("#my-email").focus();
            isEmailBlock = false;
        } else {
            var email = $("#my-email").val();

            if (!/\S+@\S+\.\S+/.test(email)) {
                Dialog.showInfoDialog("Nieprawidłowy format adresu email");
                return;
            }

            SOCKET.getSocket().emit('changeEmail', email, function (success) {
                if (success) {
                    Dialog.showInfoDialog("Email został zmieniony");
                } else {
                    Dialog.showInfoDialog("Wystąpił problem podczas zmiany adresu email");
                }
            });

            $(this).text("zmień");
            $("#my-email").attr('readonly', true);
            isEmailBlock = true;
        }
    });



    $("#close-my-account").on('click', function () {
        that.isMyAccountActive = false;
        $("#my-account-container").remove();
    });













};

TopMenu.hideMyAccount = function () {
    $("#myAccount").remove();
};




TopMenu.init = function () {
    $("#top-menu").show();
    var that = this;
    $("#show-ranking").on('click', function () {
        if (that.isRankingActive) {
            return;
        }
        that.isRankingActive = true;
        TopMenu.showRanking();
    });

    $("#my-account").on('click', function () {
        if (that.isMyAccountActive) {
            return;
        }
        that.isMyAccountActive = true;
        TopMenu.showMyAccount();
    });

    $("#logout").on('click', function () {
        sessionStorage.setItem('logged', 'false');
        $("#top-menu").hide();
        if (gameArea !== null) {
            gameArea.stopTimer();
            gameArea = null;
        }
        SOCKET.getSocket().disconnect();
        (new Forms()).init();
        $("#global-chat-container").empty();
        $("#global-chat-container").hide();
    });
};



