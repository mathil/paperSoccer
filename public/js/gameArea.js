
var self;


var GameArea = function () {

};

GameArea.prototype.init = function (params) {
    console.log(JSON.stringify(params));
    this.playerA = params.playerA;
    this.playerB = params.playerB;
    this.playerAColorLine = params.playerAColorLine;
    this.playerBColorLine = params.playerBColorLine;
    this.lastPoint = params.lastPoint;
    this.setSgameArea();
    self = this;

};


/**
 * Rysowanie planszy gry
 */
GameArea.prototype.drawArea = function () {
    this.nodes = this.fillNodes();
    var canvas = document.getElementById('game-canvas');
    var context = canvas.getContext('2d');

    canvas.width = 630;
    canvas.height = 450;

    context.strokeStyle = '#ffffff';
    context.lineWidth = 2;
    context.lineCap = 'butt';
    context.fillStyle = "#FFFFFF";


    context.beginPath();
    context.moveTo(90, 45);
    context.lineTo(540, 45);

    context.moveTo(540, 45);
    context.lineTo(540, 180);

    context.moveTo(540, 180);
    context.lineTo(585, 180);

    context.moveTo(585, 180);
    context.lineTo(585, 270);

    context.moveTo(585, 270);
    context.lineTo(540, 270);

    context.moveTo(540, 270);
    context.lineTo(540, 405);

    context.moveTo(540, 405);
    context.lineTo(90, 405);

    context.moveTo(90, 405);
    context.lineTo(90, 270);

    context.moveTo(90, 270);
    context.lineTo(45, 270);

    context.moveTo(45, 270);
    context.lineTo(45, 180);

    context.moveTo(45, 180);
    context.lineTo(90, 180);

    context.moveTo(90, 180);
    context.lineTo(90, 45);


    for (var i = 135; i <= 495; i += 45) {
        for (var j = 90; j <= 360; j += 45) {
            context.fillRect(i, j, 2, 2);
        }
    }
    context.fillRect(90, 225, 2, 2);
    context.fillRect(540, 225, 2, 2);

    context.stroke();

    canvas.onclick = function (evt) {
        if (self.lock) {
            return;
        }

        var rect = canvas.getBoundingClientRect();
        var x = Math.round((evt.clientX - rect.left) * (canvas.width / canvas.offsetWidth));
        var y = Math.round((evt.clientY - rect.top) * (canvas.height / canvas.offsetHeight));
        var nearest = self.getNearestNode(x, y);
        alert(JSON.stringify(nearest));

        SOCKET.getSocket().emit('validateMove', {
            from: {
                x: self.lastPoint.x,
                y: self.lastPoint.y
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
    this.lock = true;
};

GameArea.prototype.unlockArea = function () {
    this.lock = false;
};

GameArea.prototype.setSgameArea = function () {
    $("#player-a-nick").html(this.playerA);
    $("#player-b-nick").html(this.playerB);
    $("#score").html("0:0");

};