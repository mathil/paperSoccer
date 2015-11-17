var User = function(nickname, id) {
    this.nickname = nickname;
    this.id = id;
    this.roomId = null;
    this.hasGame = false;
};

module.exports = User;

User.prototype.setRoomId = function(roomId) {
    this.roomId = roomId;
};

User.prototype.getRoomId = function() {
    return this.roomId;
};

User.prototype.setHasGame = function(hasGame) {
    this.hasGame = hasGame;
};

User.prototype.getNickname = function() {
    return this.nickname;
}


User.prototype.hasGame = function() {
    return this.hasGame;
};

User.prototype.getId = function() {
    return this.id;
};