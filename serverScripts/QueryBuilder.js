
var QueryBuilder = function () {
    var mysql = require('mysql');
    this.dbConn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'localhost',
        database: 'papersoccer'
    });
    this.dbConn.connect();
};


QueryBuilder.prototype.checkLogin = function (nickname, password, callback) {
    this.dbConn.query("SELECT id FROM user WHERE nickname = '" + nickname + "' AND password = md5('" + password + "')", function (err, rows, field) {
        if (!err) {
            return callback(rows.length > 0);
        } else {
            return callback(err);
        }
    });
};

QueryBuilder.prototype.checkIsUserExists = function (nickname, email, callback) {
    this.dbConn.query("SELECT id FROM user WHERE nickname = '" + nickname + "' OR email = '" + email + "'", function (err, rows, field) {
        if (!err) {
            return callback(rows.length > 0);
        } else {
            return callback(err);
        }
    });
};

QueryBuilder.prototype.insertUser = function (nickname, email, password, callback) {
    this.dbConn.query("INSERT INTO user (nickname, email, password) VALUES ('" + nickname + "', '" + email + "', md5('" + password + "'))", function (err, rows, field) {
        if(!err) {
            callback(true);
        } else {
            callback(false);
        }
    });
};




module.exports = QueryBuilder;