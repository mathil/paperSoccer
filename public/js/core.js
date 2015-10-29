

var Core = function () {

};

Core.prototype.setBasicParameters = function (params) {
    this.playerA = params.playerA;
    this.playerB = params.playerB;
    this.playerAColorLine = params.playerAColorLine;
    this.playerBColorLine = params.playerBColorLine;
    $("#score").html(this.playerA + "0 : 0" + this.playerB);
};


/**
 * Rysowanie planszy gry
 */
Core.prototype.drawArea = function () {
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

    var self = this;
    canvas.onclick = function (evt) {
        console.log(canvas.width + " x " + canvas.height);
        var rect = canvas.getBoundingClientRect();

        var x = Math.round((evt.clientX - rect.left) * (canvas.width / canvas.offsetWidth));
        var y = Math.round((evt.clientY - rect.top) * (canvas.height / canvas.offsetHeight));

        var nearest = self.getNearestNode(x, y);
        alert(JSON.stringify(nearest));
    };
};


Core.prototype.fillNodes = function () {
    var nodes = [];
    for (var i = 90; i <= 540; i += 45) {
        for (var j = 45; j <= 405; j += 45) {
            nodes.push({x: i, y: j});
        }
    }
    return nodes;
};

Core.prototype.getNearestNode = function (x, y) {
    var nearestNode;
    this.nodes.forEach(function (node) {
        if ((x < node.x + 22 && x > node.x - 23) && (y < node.y + 22 && y > node.y - 23))
            nearestNode = node;
    });
    return nearestNode;
};