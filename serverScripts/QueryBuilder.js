
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

QueryBuilder.prototype.checkIfUserExists = function (nickname, email, callback) {
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
        if (!err) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

QueryBuilder.prototype.updateScore = function (winner, loser) {
    var gameHistoryQuery = "INSERT INTO game_history(winner_id, loser_id) VALUES (" +
            "(SELECT id FROM user WHERE nickname='" + winner + "')," +
            "(SELECT id FROM user WHERE nickname='" + loser + "'))";

    this.dbConn.query(gameHistoryQuery, function (err, rows, field) {
        console.log('gameHistoryQuery');
        console.log(err);
    });

    var updateWinnerQuery = "UPDATE user SET won_matches=won_matches+1, " +
            "luck=IF(luck > 0, luck+1, 1) " +
            "WHERE nickname='" + winner + "'";

    this.dbConn.query(updateWinnerQuery, function (err, rows, field) {
        console.log('updateWinnerQuery');
        console.log(err);
    });

    var updateLoserQuery = "UPDATE user SET lost_matches=won_matches+1, " +
            "luck=IF(luck < 0, luck-1, -1) " +
            "WHERE nickname='" + loser + "'";

    this.dbConn.query(updateLoserQuery, function (err, rows, field) {
        console.log('updateLoserQuery');
        console.log(err);
    });
};

QueryBuilder.prototype.getScoreForAllUsers = function (callback) {
    this.dbConn.query("SELECT nickname, won_matches, lost_matches, luck FROM user", function (err, rows, field) {
        callback(rows);
    });
};





module.exports = QueryBuilder;