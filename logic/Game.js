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
        lastPoint: this.lastPoint
    };
};

Game.prototype.haveNextMove = function () {
};


Game.prototype.isValidMove = function (x, y) {
    if (!((that.lastPoint.x - 45 <= x && that.lastPoint.x + 45 >= x)
            && (that.lastPoint.y - 45 <= y && that.lastPoint.y + 45 >= y))) {
        console.log('98');
        return false;
    }

    if (this.validatePath(this.lastPoint.x, this.lastPoint.y, x, y)) {
        console.log('sciezka uzyta');
        return false;
    }

    this.usedPatches.push(
            {
                startX: this.lastPoint.x,
                startY: this.lastPoint.y,
                endX: x,
                endY: y
            }
    );


    that.lastPoint.x = x;
    that.lastPoint.y = y;
    return true;

};

Game.prototype.initNodesArray = function () {
    var nodes = [];
    for (var i = 90; i <= 540; i += 45) {
        for (var j = 45; j <= 405; j += 45) {
            nodes.push({x: i, y: j, used: false});
        }
    }
    return nodes;
};


Game.prototype.isNodeUsed = function (x, y) {
    var used = false;
    that.usedNodes.forEach(function (node) {
        if (node.x === x && node.y === y) {
            if (node.used)
                return true;
            return false;
        }
    });
    return used;
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

Game.prototype.validNode = function () {
    if (this.isNodeUsed(this.lastPoint.x, this.lastPoint.y)) {
        if (this.isMoveAvailable()) {
            return true;
        }
    }
    return false;
};

Game.prototype.isMoveAvailable = function () {
    var x = this.lastPoint.x;
    var y = this.lastPoint.y;

    var isAvailable = true;

    this.usedPatches.forEach(function (path) {
        if (path.startX === x - 45 && path.startY === y - 45) {
            isAvailable = false;
        } else if (path.startX === x && path.startY === y - 45) {
            isAvailable = false;
        } else if (path.startX === x + 45 && path.startY === y - 45) {
            isAvailable = false;
        } else if (path.startX === x - 45 && path.startY === y) {
            isAvailable = false;
        } else if (path.startX === x + 45 && path.startY === y) {
            isAvailable = false;
        } else if (path.startX === x - 45 && path.startY === y + 45) {
            isAvailable = false;
        } else if (path.startX === x && path.startY === y + 45) {
            isAvailable = false;
        } else if (path.startX === x + 45 && path.startY === y + 45) {
            isAvailable = false;
        }
    });
    return isAvailable;
};




module.exports = Game;
