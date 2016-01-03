
var that;


var GameArea = function () {

};

GameArea.prototype.init = function (params, nickname) {
    console.log(JSON.stringify(params));
    this.playerA = params.playerA;
    this.playerB = params.playerB;
    this.playerAColorLine = params.playerAColorLine;
    this.playerBColorLine = params.playerBColorLine;
    this.lastPoint = params.lastPoint;
    this.canvas = null;
    this.context = null;
    this.lock = null;
    this.initGameArea();
    that = this;
};


/**
 * Rysowanie planszy gry
 */
GameArea.prototype.drawArea = function () {
    this.nodes = this.fillNodes();
    this.canvas = document.getElementById('game-canvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 630;
    this.canvas.height = 450;

    this.context.strokeStyle = '#ffffff';
    this.context.lineWidth = 2;
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


    for (var i = 135; i <= 495; i += 45) {
        for (var j = 90; j <= 360; j += 45) {
            this.context.fillRect(i, j, 2, 2);
        }
    }
    this.context.fillRect(90, 225, 2, 2);
    this.context.fillRect(540, 225, 2, 2);

    this.context.stroke();

    this.canvas.onclick = function (evt) {
        if (that.lock) {
            return;
        }

        var rect = that.canvas.getBoundingClientRect();
        var x = Math.round((evt.clientX - rect.left) * (that.canvas.width / that.canvas.offsetWidth));
        var y = Math.round((evt.clientY - rect.top) * (that.canvas.height / that.canvas.offsetHeight));
        var nearest = that.getNearestNode(x, y);

        SOCKET.getSocket().emit('validateMove', {
            from: {
                x: that.lastPoint.x,
                y: that.lastPoint.y
            },
            to: {
                x: nearest.x,
                y: nearest.y
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

GameArea.prototype.drawLine = function () {

};

GameArea.prototype.lockArea = function () {
    console.log('lockarea');
    this.lock = true;
};

GameArea.prototype.unlockArea = function () {
    console.log('unlockarea');
    this.lock = false;
};

GameArea.prototype.initGameArea = function () {
    $("#player-a-nick").html(this.playerA);
    $("#player-b-nick").html(this.playerB);
    $("#score").html("0:0");
};

GameArea.prototype.drawMove = function(x, y) {
    this.context.beginPath();
    this.context.moveTo(this.lastPoint.x, this.lastPoint.y);
    this.context.lineTo(x, y);
    this.context.stroke();
    this.lastPoint.x = x;
    this.lastPoint.y = y;
    if(!this.lock) {
        this.lockArea();
    } else {
        this.unlockArea();
    }
};