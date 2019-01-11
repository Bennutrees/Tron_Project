var http = require('http');
var fs = require('fs');
var allUser;
var connectedUser= '{ "players": [ ] }';

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.write('Welcome');  
  res.end();
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
  
    if(fs.existsSync('user.json')){
      allUser = JSON.parse(fs.readFileSync('user.json'));
      for(var i = 0; i<allUser.players.length; i++){
        allUser.players[i].connected = 0;
      }
    }
    
    socket.on('message', function (pseudo) {      
      var date = new Date().toUTCString();      
      if(allUser == undefined){
        allUser = '{ "players": [ ] }';
        var newUser = {
          "nickname": pseudo,
          "nbWin": 0,
          "lastConnection": date,
          "connected": 1
        }
        allUser = JSON.parse(newUser);
        allUser.players.push(newUser);
        
        socket.emit('message', '1');
      }
      else{        
        var it = 0;
        while(it < allUser.players.length && allUser.players[it].nickname != pseudo){
          it++;
        }

        if(it == allUser.players.length){
          var newUser = {
            "nickname": pseudo,
            "nbWin": 0,
            "lastConnection": date,
            "connected": 1
          }
          
          socket.emit('message', '1');
          allUser.players.push(newUser);
        }
        else{
            if(allUser.players[it].connected == 0){
              var currentDate = new Date().toUTCString();
              var timelaps = Date.parse(currentDate)-Date.parse(allUser.players[it].lastConnection);
              console.log(timelaps);
              if(timelaps > 600000){
                allUser.players[it].connected = 1;
                socket.emit('message', '1');
              }
              else{
                socket.emit('message', 'Disconnect too recent');
              }
            }
            else{
              socket.emit('message', 'Nickname already used');
            }
        }
      }
    });

    socket.on('deco', function(player){
      var it = 0;
      while(it < allUser.players.length && allUser.players[it].nickname != player){
        it++;
      }
      console.log(allUser.players[it]);
      allUser.players[it].connected = 0;
      socket.emit('deco','1');
    });
});

server.listen(8080);

setInterval(function(){
  if(allUser != undefined){
    fs.writeFile('user.json', JSON.stringify(allUser), function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  }
  else{
    console.log('No data to save!');
  }
}, 30000);