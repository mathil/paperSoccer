$(document).ready(function(){

  var socket = new Socket();
  var nickname = "";


  socket.on('loginResponse', function(data) {
    console.log('ifUserExists ' + data.isUserExists);
    if(data.isUserExists) {
      alert("Użytkownik o takiej nazwie jest już w systemie");
    } else {
      this.nickname = $("#login").val();
      $("#login-form").hide();
      $("#global-chat").show();

      var content = "";
      console.log(data);
      (data.players).forEach(function(player){
        content += "<button class='player' id='" + player.nickname + "'>" + player.nickname + "</button>";
      });
      $("#players").html(content);
    }

  });

  socket.on('updateGlobalChat', function(data) {
    $("#global-chat-area").val($("#global-chat-area").val() + '\n' + data.message);
  });




  $('#login-form-form').submit(function(evt){
    evt.preventDefault();
    socket.emit('login', {
      nickname: $('#login').val()
    });
  });


  $("#global-chat-send-message").click(function() {
    socket.emit('globalChatMessage', {
      message: $("#global-chat-message").val()
    })
    $("#global-chat-message").val("");
  });


  $("#players-list").on('click', '.player', function(){
    var id = $(this).attr('id');
    socket.emit('invite', {
      from: this.nickname,
      to: id
    });
  });


});
