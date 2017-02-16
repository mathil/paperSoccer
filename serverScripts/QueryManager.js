
var QueryManager = function () {
    var mysql = require('mysql');
    this.dbConn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'localhost',
        database: 'papersoccer'
    });
    this.dbConn.connect();
};

QueryManager.prototype.convertDate = function convertDate(date) {
    date = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' +
            ('00' + date.getUTCHours()).slice(-2) + ':' +
            ('00' + date.getUTCMinutes()).slice(-2) + ':' +
            ('00' + date.getUTCSeconds()).slice(-2);
    return date;
};



QueryManager.prototype.checkLogin = function (nickname, password, callback) {
    this.dbConn.query("SELECT id FROM user WHERE nickname = '" + nickname + "' AND password = md5('" + password + "')", function (err, rows, field) {
        if (!err) {
            return callback(rows.length > 0);
        } else {
            return callback(err);
        }
    });
};

QueryManager.prototype.checkIfUserExists = function (nickname, email, callback) {
    this.dbConn.query("SELECT id FROM user WHERE nickname = '" + nickname + "' OR email = '" + email + "'", function (err, rows, field) {
        if (!err) {
            return callback(rows.length > 0);
        } else {
            return callback(err);
        }
    });
};

QueryManager.prototype.insertUser = function (nickname, email, password, callback) {
    this.dbConn.query("INSERT INTO user (nickname, email, password, won_matches, lost_matches, luck, score) VALUES ('" + nickname + "', '" + email + "', md5('" + password + "'), 0, 0, 0, 0)", function (err, rows, field) {
        if (!err) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

QueryManager.prototype.updateScore = function (winner, loser) {
    var gameHistoryQuery = "INSERT INTO game_history(winner_id, loser_id, datetime) VALUES (" +
            "(SELECT id FROM user WHERE nickname='" + winner + "')," +
            "(SELECT id FROM user WHERE nickname='" + loser + "'), " +
            "'" + this.convertDate(new Date()) +"')";

    this.dbConn.query(gameHistoryQuery, function (err, rows, field) {
    });

    var updateWinnerQuery = "UPDATE user SET won_matches=won_matches+1, " +
            "luck=IF(luck > 0, luck+1, 1), " +
            "score=IF(luck > 0, score+luck*10, score+10) " +
            "WHERE nickname='" + winner + "'";

    this.dbConn.query(updateWinnerQuery, function (err, rows, field) {
    });

    var updateLoserQuery = "UPDATE user SET lost_matches=lost_matches+1, " +
            "luck=IF(luck < 0, luck-1, -1), " +
            "score=IF(luck < 0, score-ABS(luck)*10, score-10) "+
            "WHERE nickname='" + loser + "'";

    this.dbConn.query(updateLoserQuery, function (err, rows, field) {
    });
};

QueryManager.prototype.getScoreForAllUsers = function (callback) {
    this.dbConn.query("SELECT nickname, won_matches, lost_matches, luck, score FROM user ORDER BY score DESC", function (err, rows, field) {
        callback(rows);
    });
};

QueryManager.prototype.getUserProperties = function (nickname, callback) {
    var that = this;
    this.dbConn.query("SELECT nickname, email, won_matches, lost_matches, luck FROM user WHERE nickname='" + nickname + "'", function (err, rows, field) {
        var properties = rows[0];

        var gameHistoryQuery = "SELECT loser.nickname as loser, winner.nickname as winner, DATE_FORMAT(datetime, '%d.%m.%Y %H:%i:%s') as datetime " +
                "FROM game_history " +
                "LEFT JOIN user loser on loser.id=game_history.loser_id " +
                "LEFT JOIN user winner on winner.id=game_history.winner_id " +
                "WHERE loser.nickname = '" + nickname + "' OR winner.nickname='" + nickname + "' " +
                "ORDER BY datetime DESC";

        that.dbConn.query(gameHistoryQuery, function (err, rows, field) {
            callback({
                properties: properties,
                gameHistory: rows
            });
        });
    });
};

QueryManager.prototype.changePassword = function (nickname, currentPassword, newPassword, callback) {
    var that = this;
    this.dbConn.query("SELECT id FROM user WHERE nickname='" + nickname + "' AND password=md5('" + currentPassword + "')", function (err, rows, field) {
        if (rows.length > 0) {
            that.dbConn.query("UPDATE user SET password=md5('" + newPassword + "') WHERE nickname='" + nickname + "'", function (err, rows, field) {
                if (!err) {
                    callback('success');
                } else {
                    callback('error');
                }
            });
        } else {
            callback('currentPasswordNotMatch');
        }
    });
};

QueryManager.prototype.changeEmail = function (nickname, email, callback) {
    this.dbConn.query("UPDATE user SET email='" + email + "' WHERE nickname='" + nickname + "'", function (err, rows, field) {
        if (!err) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

QueryManager.prototype.resetPassword = function (email, newPassword, callback) {
    var that = this;
    this.dbConn.query("SELECT nickname FROM user WHERE email='" + email + "'", function (err, rows, field) {
        if (!err && rows.length > 0) {
            var nickname = rows[0].nickname;
            that.dbConn.query("UPDATE user SET password=md5('" + newPassword + "') WHERE email='" + email + "'", function (err, rows, field) {
                if (!err) {
                    callback(nickname);
                } else {
                    callback(null);
                }
            });
        } else {
            callback(false);
        }
    });
};



module.exports = QueryManager;