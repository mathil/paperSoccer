/**
 * Logika gry
 */

var that;


/**
 * Konstruktor
 * @param {type} playerA nickname gracza
 * @param {type} playerB nickname gracza
 * @param {type} roomId id pokoju node.js
 * @returns {Game}
 */
var Game = function (playerA, playerB, roomId) {
    this.playerA = playerA;
    this.playerB = playerB;
    this.roomId = roomId;
    this.scorePlayerA = 0;
    this.scorePlayerB = 0;
    this.playerAColorLine = "";
    this.playerBColorLine = "";
    this.usedNodes = this.initNodesArray();
    this.usedPatches = [];
    this.hasMove = playerA;
    console.log('hasMove ' + this.hasMove);
    this.lastPoint = {// domyślnie środek planszy
        x: 315,
        y: 225
    };

    var colors = ["#ff0000", "#0000FF"];
    if (Math.random() >= 0.5) {
        this.playerAColorLine = colors[0];
        this.playerBColorLine = colors[1];
    } else {
        this.playerAColorLine = colors[1];
        this.playerBColorLine = colors[0];
    }
    that = this;

};


Game.prototype.getPlayerA = function () {
    return this.playerA;
};

Game.prototype.getPlayerB = function () {
    return this.playerB;
};

Game.prototype.increaseScoreForPlayerA = function (score) {
    this.scorePlayerA++;
};

Game.prototype.increaseScoreForPlayerB = function (score) {
    this.scorePlayerB++;
};

Game.prototype.getRoomId = function () {
    return this.roomId;
};

Game.prototype.getStartGameParameters = function () {
    return {
        playerA: this.playerA,
        playerB: this.playerB,
        playerAColorLine: this.playerAColorLine,
        playerBColorLine: this.playerBColorLine,
        lastPoint: this.lastPoint,
        hasMove: this.hasMove
    };
};

Game.prototype.validateMove = function (x, y) {
    var response = null;

    if (this.isValidMove(x, y)) {
        response = {
            isValid: true,
            hasMove: this.hasMove,
            x: this.lastPoint.x,
            y: this.lastPoint.y,
            lineColor: this.hasMove === this.playerA ? this.playerAColorLine : this.playerBColorLine
        };
    } else {
        response = {
            isValid: false,
            hasMove: this.hasMove,
        };
    }
    return response;
};

Game.prototype.isValidMove = function (x, y) {

    //Sprawdzenie czy ścieżna nie jest już zarejestrowana
    if (this.validatePath(this.lastPoint.x, this.lastPoint.y, x, y)) {
        return false;
    }

    //Sprawdzenie czy gracz posiada pole manewru
    if (!this.isMoveAvailable(x, y)) {
        return false;
    }

    //Sprawdzenie czy węzeł pozwala na kontynuowanie ruchu, jeśli nie to zmiana gracza
    this.setNextMoveUser(x, y);


    this.usedPatches.push({
        startX: this.lastPoint.x,
        startY: this.lastPoint.y,
        endX: x,
        endY: y
    });

    this.lastPoint.x = x;
    this.lastPoint.y = y;

    return true;

};


Game.prototype.initNodesArray = function () {
    var nodes = [];
    for (var i = 90; i <= 540; i += 45) {
        for (var j = 45; j <= 405; j += 45) {
            nodes.push(
                    {
                        x: i,
                        y: j,
                        used: (i === 90 || i === 540) || (j === 45 || j === 405) ? true : false
                    }
            );
        }
    }
    return nodes;
};

Game.prototype.setNodeAsUsed = function () {
    this.usedNodes.forEach(function (node) {
        if (node.x === that.lastPoint.x && node.y === that.lastPoint.y) {
            if (node.used) {
                that.changeMovePlayer();
            } else {
                node.used = true;
            }
            return;
        }
    });
};

Game.prototype.validatePath = function (startX, startY, endX, endY) {
    var firstCondition = false;
    var secondCondition = false;
    this.usedPatches.forEach(function (path) {
        if (path.startX === startX
                && path.startY === startY
                && path.endX === endX
                && path.endY === endY) {
            firstCondition = true;
        }
        if (path.startX === endX
                && path.startY === endY
                && path.endX === startX
                && path.endY === startY) {
            secondCondition = true;
        }
    });
    return firstCondition || secondCondition;
};

Game.prototype.isMoveAvailable = function (x, y) {
    //TO DO
    return true;
};

Game.prototype.setNextMoveUser = function (x, y) {
    console.log('x ' + x);
    console.log('y ' + y);
    this.usedNodes.forEach(function (node) {
        if (node.x === x && node.y === y) {
            console.log('node.x=' + node.x);
            console.log('node.y=' + node.y);
            console.log('node.used=' + node.used);
            if (!node.used) {
                that.changeNextMoveUser();
                node.used = true;
            }
            return;
        }
    });

};

Game.prototype.changeNextMoveUser = function () {
    if (this.hasMove === this.playerA) {
        this.hasMove = this.playerB;
    } else {
        this.hasMove = this.playerA;
    }
};


module.exports = Game;
