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
    this.userANextGameApproved = null;
    this.userBNextGameApproved = null;
    this.lastPoint = {// domyślnie środek planszy
        x: 315,
        y: 225
    };

    var colors = ["#CC0000", "#000099"];
    if (Math.random() >= 0.5) {
        this.playerAColorLine = colors[0];
        this.playerBColorLine = colors[1];
    } else {
        this.playerAColorLine = colors[1];
        this.playerBColorLine = colors[0];
    }

    this.playerAGoalNodes = [
        {x: 45, y: 180},
        {x: 45, y: 225},
        {x: 45, y: 270}
    ];
    this.playerBGoalNodes = [
        {x: 585, y: 180},
        {x: 585, y: 225},
        {x: 585, y: 270}
    ];

    this.moveHistory = [];

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

Game.prototype.initLastPoint = function () {
    this.lastPoint = {// domyślnie środek planszy
        x: 315,
        y: 225
    };
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
    var lineColor = this.hasMove === this.playerA ? this.playerAColorLine : this.playerBColorLine;
    var lastPointCopy = {
        x: this.lastPoint.x,
        y: this.lastPoint.y
    };
    if (this.isValidMove(x, y)) {

        response = {
            isValid: true,
            hasMove: this.hasMove,
            x: this.lastPoint.x,
            y: this.lastPoint.y,
            lineColor: lineColor,
        };

        //Sprawdzenie czy gracz posiada pole manewru
        var availableMoves = this.getAvailableMovesCount(lastPointCopy, x, y);
        console.log("Możliwe ruchy: " + availableMoves);
        if (availableMoves === 0) {
            response.moveNotAvailable = true;
        } else {
            var goalForPlayer = this.isGoalMove(x, y);
            if (goalForPlayer !== null) {
                response.isGoalMove = true;
                response.goalFor = goalForPlayer;
                response.score = this.scorePlayerA + ":" + this.scorePlayerB;
                this.resetGame();
                response.resetGameParams = {
                    lastPoint: this.lastPoint
                };
            } else {
                response.isGoalMove = false;
            }
        }

    } else {
        console.log("Zły ruch");
        response = {
            isValid: false,
            hasMove: this.hasMove,
        };
    }
    return response;
};

Game.prototype.isValidMove = function (x, y) {

    //Sprawdzenie czy ścieżna nie nachodzi na krawędź boiska
    if (!this.isNotBorder(this.lastPoint.x, this.lastPoint.y, x, y)) {
        console.log("Jest krawędź");
        return false;
    }

    //Sprawdzenie czy ścieżna nie jest już zarejestrowana
    if (this.validatePath(this.lastPoint.x, this.lastPoint.y, x, y)) {
        console.log("Jest użyta");
        return false;
    }

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
                        used: this.shouldNodeBeUsed(i, j)
                    }
            );
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

Game.prototype.shouldNodeBeUsed = function (x, y) {
    if (x === 315 && y === 225) {
        return true;
    } else if (x === 540 && y === 225) {
        return false;
    } else if (x === 90 && y === 225) {
        return false;
    } else if (x === 90 || x === 540) {
        return true;
    } else if (y === 315 || y === 225) {
        return false;
    }
    return false;
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

Game.prototype.isNotBorder = function (startX, startY, endX, endY) {
    if (startX === 90 && endX === 90) {
//        if (startY < 180 && endY > 290) {
        return false;
//        }
    } else if (startX === 540 && endX === 540) {
//        if (startY < 225 && endY > 290) {
        return false;
//        }
    } else if (startY === 45 && endY === 45) {
        return false;
    } else if (startY === 405 && endY === 405) {
        return false;
    }
    return true;
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

Game.prototype.getAvailableMovesCount = function (lastPointCopy, x, y) {
    var availableMoves = 0;
    for (var i = x - 45; i <= x + 45; i += 45) {
        for (var j = y - 45; j <= y + 45; j += 45) {
            if (!(i === x && j === y) && this.isNodeInArea(i, j) && (i !== lastPointCopy.x && j !== lastPointCopy.y)) {
                if (!this.validatePath(x, y, i, j)) {
                    availableMoves++;
                }
            }
        }
    }
    return availableMoves;
};

Game.prototype.isNodeInArea = function (x, y) {
    if (x <= 45 || y <= 45 || x >= 540 || y >= 405) {
        console.log('jest poza planszą');
        return false;
    }
    return true;
};

Game.prototype.setNextMoveUser = function (x, y) {
    this.usedNodes.forEach(function (node) {
        if (node.x === x && node.y === y) {
            if (!node.used) {
                that.moveHstory = [];
                that.changeNextMoveUser();
                node.used = true;
            } else {
                that.moveHistory.push({
                    beginX: that.lastPoint.x,
                    beginY: that.lastPoint.y,
                    endX: x,
                    endY: y
                });
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

Game.prototype.isGoalMove = function (x, y) {
    var goalFor = null;
    this.playerAGoalNodes.forEach(function (node) {
        if (node.x === x && node.y === y) {
            goalFor = that.playerB;
            that.scorePlayerB++;
        }
    });
    this.playerBGoalNodes.forEach(function (node) {
        if (node.x === x && node.y === y) {
            goalFor = that.playerA;
            that.scorePlayerA++;
        }
    });

    return goalFor;
};

Game.prototype.getOpponent = function (nickname) {
    if (nickname === this.playerA)
        return this.playerB;
    else
        return this.playerA;
};

Game.prototype.switchArea = function () {
    var buffer = this.playerA;
    this.playerA = this.playerB;
    this.playerB = buffer;

    buffer = this.scorePlayerA;
    this.scorePlayerA = this.scorePlayerB;
    this.scorePlayerB = buffer;

    buffer = this.playerAColorLine;
    this.playerAColorLine = this.playerBColorLine;
    this.playerBColorLine = buffer;

    buffer = this.playerAGoalNodes;
    this.playerAGoalNodes = this.playerBGoalNodes;
    this.playerBGoalNodes = buffer;

    this.usedPatches = [];

    this.usedNodes = this.initNodesArray();

};

Game.prototype.approveNextGame = function (userNickname) {
    if (this.playerA === userNickname) {
        this.userBNextGameApproved = true;
    } else {
        return this.userANextGameApproved = true;
    }
};

Game.prototype.discardNextGame = function (userNickname) {
    if (this.playerA === userNickname) {
        this.userBNextGameApproved = false;
    } else {
        return this.userANextGameApproved = false;
    }
};

Game.prototype.checkIfOpponentApprovedNextGame = function (userNickname) {
    if (this.playerA === userNickname) {
        return this.userBNextGameApproved;
    } else {
        return this.userANextGameApproved;
    }
};

Game.prototype.resetGame = function () {
    this.usedNodes = this.initNodesArray();
    this.usedPatches = [];

    this.playerAGoalNodes = [
        {x: 45, y: 180},
        {x: 45, y: 225},
        {x: 45, y: 270}
    ];
    this.playerBGoalNodes = [
        {x: 585, y: 180},
        {x: 585, y: 225},
        {x: 585, y: 270}
    ];

    this.lastPoint = {// domyślnie środek planszy
        x: 315,
        y: 225
    };
};

Game.prototype.getHasMove = function () {
    return this.hasMove;
};





module.exports = Game;
