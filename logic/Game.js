/**
 * Logika gry
 */

var self;


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
    this.nodes = this.initNodesArray();

    this.hasNextMove = null;

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
    self = this;

};

module.exports = Game; 

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

Game.prototype.randFirstMove = function() {
    
};

Game.prototype.move = function (x, y) {
    if (!self.isValidMove())
        return;
    if (self.isNodeUsed(x, y)) {
        
    }


};

Game.prototype.isValidMove = function (x, y) {
    cosole.log('isValidMove');
    if (!(self.lastPoint.x > x + 45 || self.lastPoint.y < x - 45) &&
            !(self.lastPoint.y > y + 45 || self.lastPoint.y < y - 45)) {
        console.log('95');
        return false;
    }
    if (self.isNodeUsed(x, y)) {
        console.log('99');
        return false;
    }
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
    self.nodesArray.forEach(function (node) {
        if (node.x === x && node.y === y) {
            used = true;
            return;
        }
    });
    return used;
};















