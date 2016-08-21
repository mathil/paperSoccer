
var TopMenu = {
    isActive: false
};


TopMenu.showRanking = function () {
    var that = this;
    $("#menu-items-container").load("../views/ranking.html", function () {
        $("#close-ranking").on('click', function () {
            that.isActive = false;
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

TopMenu.init = function () {
    var that = this;
    $("#show-ranking").on('click', function () {
        if (that.isActive) {
            return;
        }
        that.isActive = true;
        TopMenu.showRanking();
    });
};



