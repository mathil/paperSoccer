/**
 * Logika gry
 */


var playerA;

var playerB;

var scorePlayerA;

var scorePlayerB;

var roomId;

/**
 * Konstruktor
 * @param {type} playerA nickname gracza
 * @param {type} playerB nickname gracza
 * @param {type} roomId id pokoju node.js
 * @returns {Game}
 */
var Game = function(playerA, playerB, roomId){
    this.playerA = playerA;
    this.playerB = playerB;
    this.roomId = roomId;
    this.scorePlayerA = 0;
    this.scorePlayerB = 0;
};

exports.Game = Game;

Game.prototype.getPlayerA = function(){
    return this.playerA;    
};

Game.prototype.getPlayerB = function(){
    return this.playerB;
};

Game.prototype.increaseScoreForPlayerA = function(score) {
    this.scorePlayerA++;
};

Game.prototype.increaseScoreForPlayerB = function(score) {
    this.scorePlayerB++;
};

Game.prototype.getRoomId = function() {
    return this.roomId;
};