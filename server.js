

// server.js
// load the things we need
var express = require('express');
var app = express();
var port = 8080;

var clients = [];

// set the view engine to ejs
app.set('view engine', 'ejs');


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/lib'));



// index page
app.get('/', function(req, res) {
  res.render('index');
});


var io = require('socket.io').listen(app.listen(port));
console.log('Serwer nasłuchuje na porcie ' + port);




io.sockets.on('connection', function(socket) {

  socket.on('login', function(data, callback) {
    var isUserExists = false;
    var players = null;

    if(getSocketByNickname(data.nickname) != null) {
      isUserExists = true;
    } else {
      console.log(data.nickname + " podłączył się do gry");
      socket.nickname = data.nickname;
      clients.push({nickname: data.nickname});
      console.log("Liczba graczy " + clients.length);
      players = clients;

    }

    socket.emit('loginResponse', {
      isUserExists: isUserExists,
      players: players
    });
  });


  socket.on('globalChatMessage', function(data) {
    io.sockets.emit('updateGlobalChat', {
      message: getCurrentTimeAsString() + " " + socket.nickname + ": " + data.message
    })
  });

  socket.on('invite', function(data){
    console.log(data);
    console.log("Zaproszenie do gry od " + data.from + " dla " + data.to);
  });




});


var getSocketByNickname = function(nickname) {
  result = null;
  clients.forEach(function(client){
    if(client.nickname == nickname){
      result = client;
    }
  });
  return result;
}


var getCurrentTimeAsString = function() {
  var date = new Date();
  var hour = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();

  // hour = hour % 2 != 0 ? hour : '0' + hour;

  return hour + ":" + minutes + ":" + seconds;
}



















