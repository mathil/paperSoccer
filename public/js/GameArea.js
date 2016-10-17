
var that;


var GameArea = function () {

};

GameArea.prototype.init = function (params) {
    this.playerA = params.playerA;
    this.playerB = params.playerB;
    this.playerAColorLine = params.playerAColorLine;
    this.playerBColorLine = params.playerBColorLine;
    this.lastPoint = params.lastPoint;
    this.lastUserPath = [];
    this.canvas = null;
    this.context = null;
    this.ballCanvas = null;
    this.ballContext = null;
    this.setScore(params.scorePlayerA, params.scorePlayerB);
    this.addListeners();
    that = this;
    this.timeForMove = 30000;
    this.timerHasStopped = false;

    this.ballImage = new Image();
    this.ballImage.src = "../img/game_area_ball.png";

    this.viewMode = "landscape";

    this.initMoveTimer();
    this.initChatListeners();
    this.initMediaQueryListener();
};


/**
 * Rysowanie planszy gry
 */
GameArea.prototype.initGameAreaListeners = function () {
    this.ballCanvas = document.getElementById("ball-canvas");
    this.ballContext = this.ballCanvas.getContext('2d');

    this.nodes = this.fillNodes();
    this.canvas = document.getElementById('game-canvas');
    this.context = this.canvas.getContext('2d');
    this.drawArea();

    this.ballImage.onload = function () {
        that.ballContext.drawImage(this, that.lastPoint.x - 5, that.lastPoint.y - 5);
    };

    this.ballCanvas.onclick = function (evt) {
        if (that.lock) {
            return;
        }

        var rect = that.canvas.getBoundingClientRect();
        var x, y;
        if (that.viewMode === 'landscape') {
            x = Math.round((evt.clientX - rect.left) * (that.canvas.width / that.canvas.offsetWidth));
            y = Math.round((evt.clientY - rect.top) * (that.canvas.height / that.canvas.offsetHeight));
        } else if (that.viewMode === 'portrait') {
            x = Math.round((evt.clientY - rect.top) * (that.canvas.width / that.canvas.offsetWidth));
            y = that.canvas.height - Math.round((evt.clientX - rect.left) * (that.canvas.height / that.canvas.offsetHeight));
        }

        var nearestNode = that.getNearestNode(x, y);

        if (!((that.lastPoint.x - 45 <= nearestNode.x && that.lastPoint.x + 45 >= nearestNode.x)
                && (that.lastPoint.y - 45 <= nearestNode.y && that.lastPoint.y + 45 >= nearestNode.y))) {
            return;
        }

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

GameArea.prototype.setMoveIcon = function (currentPlayer) {
    if (currentPlayer === this.playerA) {
        $("#player-a-move-icon").css('visibility', 'visible');
        $("#player-b-move-icon").css('visibility', 'hidden');
    } else if (currentPlayer === this.playerB) {
        $("#player-a-move-icon").css('visibility', 'hidden');
        $("#player-b-move-icon").css('visibility', 'visible');
    }
};

GameArea.prototype.setScore = function (scorePlayerA, scorePlayerB) {
    $("#player-a-nick").html(this.playerA);
    $("#player-a-nick").css('color', this.playerAColorLine);
    $("#player-b-nick").html(this.playerB);
    $("#player-b-nick").css('color', this.playerBColorLine);
    $("#score").html(scorePlayerA + ":" + scorePlayerB);
};

GameArea.prototype.drawMove = function (x, y, lineColor) {
    this.ballContext.clearRect(0, 0, this.ballCanvas.width, this.ballCanvas.height);
    this.context.strokeStyle = lineColor;
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(this.lastPoint.x, this.lastPoint.y);
    this.context.lineTo(x, y);
    this.context.stroke();

    this.ballContext.strokeStyle = lineColor;
    this.ballContext.lineWidth = 3;
    this.ballContext.beginPath();
    this.ballContext.moveTo(this.lastPoint.x, this.lastPoint.y);
    this.ballContext.lineTo(x, y);
    this.ballContext.stroke();
    this.ballContext.drawImage(this.ballImage, x - 5, y - 5);

    this.lastPoint.x = x;
    this.lastPoint.y = y;
};

GameArea.prototype.isGoalMove = function (player, score, resetGameParams) {
    $("#score").html(score);
};

GameArea.prototype.drawArea = function () {
    this.canvas.width = 630;
    this.canvas.height = 450;

    this.ballCanvas.width = 630;
    this.ballCanvas.height = 450;

    this.context.strokeStyle = '#FFFFFF';
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

    this.context.strokeStyle = this.playerAColorLine;
    this.context.fillStyle = this.playerAColorLine;
    this.context.beginPath();
    this.context.moveTo(45, 180);
    this.context.lineTo(45, 270);
    this.context.stroke();
    
    this.context.strokeStyle = this.playerBColorLine;
    this.context.fillStyle = this.playerBColorLine;
    this.context.beginPath();
    this.context.moveTo(585, 180);
    this.context.lineTo(585, 270);
    this.context.stroke();

};

GameArea.prototype.clearArea = function (params) {
    this.nodes = this.fillNodes();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

GameArea.prototype.initMoveTimer = function () {
    function updateTimer() {
        if (that.timerHasStopped) {
            return;
        }
        var timeForMoveInSecond;
        if (that.timeForMove > 0) {
            timeForMoveInSecond = that.timeForMove / 1000;
            timeForMoveInSecond = timeForMoveInSecond < 10 ? '0' + timeForMoveInSecond : timeForMoveInSecond;
            $("#time").html("0:" + timeForMoveInSecond);
            that.timeForMove -= 1000;
        } else {
            if (!that.lock) {
                SOCKET.getSocket().emit('timeForMoveHasGone');
            }
        }
        setTimeout(updateTimer, 1000);
    }
    ;
    updateTimer();
};

GameArea.prototype.resetTimeForMove = function () {
    this.timeForMove = 30000;
    this.timerHasStopped = false;
};

GameArea.prototype.addListeners = function () {
    $("#leave-game").on('click', function () {
        Dialog.createDialog({
            message: "Czy na pewno chcesz opuścić grę?",
            buttons: [
                {
                    text: "Opuść",
                    callback: function (dialogId) {
                        showGlobalChatAndRemoveGameArea();
                        SOCKET.getSocket().emit('leaveGame');
                        $("#" + dialogId).remove();
                    }
                },
                {
                    text: "Anuluj",
                    callback: function (dialogId) {
                        $("#" + dialogId).remove();
                    }
                }
            ]
        });
    });
};

GameArea.prototype.startNewGame = function (params) {
    this.clearArea();
    this.init(params);
    this.initGameAreaListeners();
    this.setMoveIcon(params.currentPlayer);
};

GameArea.prototype.stopTimer = function () {
    this.timerHasStopped = true;
};

GameArea.prototype.initChatListeners = function () {
    $("#game-chat-input-button").click(function () {
        sendGameChatMessage();
    });

    $("#game-chat-input").keypress(function (e) {
        if (e.which === 13) {
            sendGameChatMessage();
        }
    });

    function sendGameChatMessage() {
        SOCKET.getSocket().emit('gameChatMessage', {
            message: $("#game-chat-input").val()
        });
        $("#game-chat-input").val("");
    }
};

GameArea.prototype.initMediaQueryListener = function () {
    var mobileViewport = window.matchMedia("screen and (max-width: 1200px)");

    if (mobileViewport.matches) {
        that.viewMode = "portrait";
    } else {
        that.viewMode = "landscape";
    }

    mobileViewport.addListener(function (mq) {
        if (mq.matches) {
            that.viewMode = "portrait";
        } else {
            that.viewMode = "landscape";
        }
    });
};