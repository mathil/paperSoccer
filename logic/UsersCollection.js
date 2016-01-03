var self;

var UsersCollection = function() {
    this.users = [];
    self = this;
};


UsersCollection.prototype.add = function(user) {
    this.users.push(user);
};

UsersCollection.prototype.isExists = function(nickname) {
    var isExists = false;
    self.users.forEach(function(user) {
        if(user.getNickname() === nickname) {
            isExists = true;
        }
    });
    return isExists;
};

UsersCollection.prototype.remove = function(nickname) {
    var index = -1;
    for(var i=0; i < self.users.length; i++) {
        if(self.users[i].getNickname() === nickname) {
            index = i;
            break;
        }
    };
    if(index > -1) {
        this.users.splice(index, 1);
    }
};

UsersCollection.prototype.getByNickname = function(nickname) {
    var result = null;
    this.users.forEach(function(user) {
        if(user.getNickname() === nickname) {
            result = user;
            return;
        }
    });
    return result;
};

UsersCollection.prototype.getSize = function() {
    return this.users.length;
};

UsersCollection.prototype.getList = function() {
    var list = [];
    this.users.forEach(function(user){
        list.push({
            nickname: user.getNickname(),
            id: user.getId()
        });
    });
    return list;
};


module.exports = UsersCollection;
