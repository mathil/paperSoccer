
var that;


var GameArea = function () {

};

GameArea.prototype.init = function (params, nickname) {
    this.playerA = params.playerA;
    this.playerB = params.playerB;
    this.playerAColorLine = params.playerAColorLine;
    this.playerBColorLine = params.playerBColorLine;
    this.lastPoint = params.lastPoint;
    this.lastUserPath = [];
    this.canvas = null;
    this.context = null;
    this.initGameArea();
    this.addListeners();
    that = this;
    this.timeForMove = 30000;
    this.initMoveTimer();
};


/**
 * Rysowanie planszy gry
 */
GameArea.prototype.initArea = function () {
    this.nodes = this.fillNodes();
    this.canvas = document.getElementById('game-canvas');
    this.context = this.canvas.getContext('2d');

    this.drawArea();

    this.canvas.onclick = function (evt) {
        if (that.lock) {
            return;
        }

        var rect = that.canvas.getBoundingClientRect();
        var x = Math.round((evt.clientX - rect.left) * (that.canvas.width / that.canvas.offsetWidth));
        var y = Math.round((evt.clientY - rect.top) * (that.canvas.height / that.canvas.offsetHeight));


        var nearestNode = that.getNearestNode(x, y);

        if (!((that.lastPoint.x - 45 <= nearestNode.x && that.lastPoint.x + 45 >= nearestNode.x)
                && (that.lastPoint.y - 45 <= nearestNode.y && that.lastPoint.y + 45 >= nearestNode.y))) {
            return;
        }

        console.log("-----");
        console.log("from.x=" + that.lastPoint.x);
        console.log("from.y=" + that.lastPoint.y);
        console.log("to.x" + nearestNode.x);
        console.log("to.y" + nearestNode.y);

        SOCKET.getSocket().emit('validateMove', {
            from: {
                x: that.lastPoint.x,
                y: that.lastPoint.y
            },
            to: {
                x: nearestNode.x,
                y: nearestNode.y
            }
        });
    };
};


GameArea.prototype.fillNodes = function () {
    var nodes = [];
    for (var i = 90; i <= 540; i += 45) {
        for (var j = 45; j <= 405; j += 45) {
            nodes.push({x: i, y: j});
        }
    }
    nodes.push({x: 45, y: 180});
    nodes.push({x: 45, y: 225});
    nodes.push({x: 45, y: 270});
    nodes.push({x: 585, y: 180});
    nodes.push({x: 585, y: 225});
    nodes.push({x: 585, y: 270});
    return nodes;
};

GameArea.prototype.getNearestNode = function (x, y) {
    var nearestNode;
    this.nodes.forEach(function (node) {
        if ((x < node.x + 22 && x > node.x - 23) && (y < node.y + 22 && y > node.y - 23))
            nearestNode = node;
    });
    return nearestNode;
};

GameArea.prototype.lockArea = function () {
    this.lock = true;
};

GameArea.prototype.unlockArea = function () {
    this.lock = false;
};

GameArea.prototype.setMoveIcon = function (hasMove) {
    if (hasMove === this.playerA) {
        $("#player-a-move-icon").css('visibility', 'visible');
        $("#player-b-move-icon").css('visibility', 'hidden');
    } else if (hasMove === this.playerB) {
        $("#player-a-move-icon").css('visibility', 'hidden');
        $("#player-b-move-icon").css('visibility', 'visible');

    }
}

GameArea.prototype.initGameArea = function () {
    $("#player-a-nick").html(this.playerA);
    $("#player-a-nick").css('color', this.playerAColorLine);
    $("#player-b-nick").html(this.playerB);
    $("#player-b-nick").css('color', this.playerBColorLine);
    $("#score").html("0:0");
};

GameArea.prototype.drawMove = function (x, y, lineColor) {
    this.context.strokeStyle = lineColor;
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(this.lastPoint.x, this.lastPoint.y);
    this.context.lineTo(x, y);
    this.context.stroke();
    this.lastPoint.x = x;
    this.lastPoint.y = y;
};

GameArea.prototype.isGoalMove = function (player, score, resetGameParams) {
    $("#score").html(score);
    this.clearArea();
    this.lastPoint = resetGameParams.lastPoint;
    //console.log(resetGameParams.lastPoint);
};

GameArea.prototype.drawArea = function () {
    this.canvas = document.getElementById('game-canvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 630;
    this.canvas.height = 450;

    this.context.strokeStyle = '#ffffff';
    this.context.lineWidth = 4;
    this.context.lineCap = 'butt';
    this.context.fillStyle = "#FFFFFF";

    this.context.beginPath();
    this.context.moveTo(90, 45);
    this.context.lineTo(540, 45);

    this.context.moveTo(540, 45);
    this.context.lineTo(540, 180);

    this.context.moveTo(540, 180);
    this.context.lineTo(585, 180);

    this.context.moveTo(585, 180);
    this.context.lineTo(585, 270);

    this.context.moveTo(585, 270);
    this.context.lineTo(540, 270);

    this.context.moveTo(540, 270);
    this.context.lineTo(540, 405);

    this.context.moveTo(540, 405);
    this.context.lineTo(90, 405);

    this.context.moveTo(90, 405);
    this.context.lineTo(90, 270);

    this.context.moveTo(90, 270);
    this.context.lineTo(45, 270);

    this.context.moveTo(45, 270);
    this.context.lineTo(45, 180);

    this.context.moveTo(45, 180);
    this.context.lineTo(90, 180);

    this.context.moveTo(90, 180);
    this.context.lineTo(90, 45);


    for (var i = 45; i <= 630; i += 45) {
        for (var j = 45; j <= 450; j += 45) {
            this.context.fillRect(i, j, 2, 2);
        }
    }
    this.context.fillRect(90, 225, 2, 2);
    this.context.fillRect(540, 225, 2, 2);

    this.context.stroke();
};

GameArea.prototype.clearArea = function (params) {
    this.nodes = this.fillNodes();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initArea();
};

GameArea.prototype.initMoveTimer = function () {
    console.log('initmovetimer');
    function updateTimer() {
        console.log('updateTimer');
        var timeForMoveAsSecond;
        if (that.timeForMove > 0) {
            timeForMoveAsSecond = that.timeForMove / 1000;
            timeForMoveAsSecond = timeForMoveAsSecond < 10 ? '0' + timeForMoveAsSecond : timeForMoveAsSecond;
            $("#time").html("0:" + timeForMoveAsSecond);
            that.timeForMove -= 1000;
            setTimeout(updateTimer, 1000);
        } else {
            SOCKET.getSocket().emit('timeForMoveHasGone');
        }
    }
    ;
    updateTimer();
};

GameArea.prototype.resetTimeForMove = function () {
    console.log('resetTimeForMove');
    this.timeForMove = 30000;
};

GameArea.prototype.addListeners = function () {
    $(document).on('click', '#leave-game', function () {

        Dialog.showConfirmDialog({
            message: "Czy chcesz opuścić grę?",
            confirmCallback: function () {
                console.log('leave game');
                SOCKET.getSocket().emit('leaveGame');
                disableGameArea();
                enableGlobalChat();
            },
            cancelCallback: null
        });
    });

    window.onbeforeunload = function (evt) {
        alert('ads');
    };
};