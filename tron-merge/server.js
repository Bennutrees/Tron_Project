var http = require('http');

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.write('Welcome');  
  res.end();
});

var io = require('socket.io').listen(server);

var rooms = [];
var roomPlayer = [];
//var roomMatrice = [];

var movement = 10;
var widthArea = 400;
var heightArea = 400;

var initValueOne = 10;
var initValueTwo = 380;

var sizePlayer = 10;
var strokePlayer = 3;
var strokeArea = 15;

var colorOne = ['skyblue','orangered','limegreen','pink'];
var colorTwo = ['royalblue','darkred','green','deeppink'];

var positionX = [10,10,380,380];
var positionY = [10,380,380,10];

function makeId() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

io.sockets.on('connection', function(socket){
	
	socket.on('newGame', function(username, id){
		//console.log(io.sockets.adapter.rooms[rooms[rooms.length-1]]);
		//console.log("---------------------------------------------");
		//console.log(rooms.length);
		//console.log(rooms);
		//console.log("---------------------------------------------");
		
		//console.log(socket.id);
		
		if(rooms.length == 0 || io.sockets.adapter.rooms[rooms[rooms.length-1]].length >= 4){
			rooms.push(makeId());
			//rooms[socket.room] = []
		}		
		//socket.room = rooms[rooms.length-1];
		/*
		if(roomPlayers[socket.room] == undefined){
			roomPlayers[socket.room] = [];	
		}
		*/
		
		socket.room = rooms[rooms.length-1];
		
		if(rooms[socket.room] == undefined){
			rooms[socket.room] = [];	
			rooms[socket.room].push('player');
			rooms[socket.room]['player'] = [];
		}
				
		//console.log(socket.adapter);
		socket.join(socket.room);
		//console.log(socket.room);
		//console.log(socket.adapter.rooms.length-1);
		//console.log(socket.adapter.rooms);
		//console.log(io.sockets.manager);
				
		roomPlayer.push(socket.id);
		roomPlayer[socket.id] = [];
		roomPlayer[socket.id].push(socket.room);
		roomPlayer[socket.id].push(username);
		
		var nbInRoom = io.sockets.adapter.rooms[socket.room].length;
		/*
		roomPlayers[socket.room].push(username);		
		roomPlayers[socket.room][username] = [];
		roomPlayers[socket.room][username].push("player"+nbInRoom);
		roomPlayers[socket.room][username].push("start");
		roomPlayers[socket.room][username].push(positionX[nbInRoom-1]);
		roomPlayers[socket.room][username].push(positionY[nbInRoom-1]);
		roomPlayers[socket.room][username].push(true);
		roomPlayers[socket.room][username].push(id);
		*/
		

		rooms[socket.room]['player'].push(username);
		rooms[socket.room]['player'][username] = [];
		rooms[socket.room]['player'][username].push("player"+nbInRoom);
		rooms[socket.room]['player'][username].push("start");
		rooms[socket.room]['player'][username].push(positionX[nbInRoom-1]);
		rooms[socket.room]['player'][username].push(positionY[nbInRoom-1]);
		rooms[socket.room]['player'][username].push(true);
		rooms[socket.room]['player'][username].push(id);
		/*
		if(io.sockets.adapter.rooms[rooms[rooms.length-1]].length == 4){
			roomMatrice.push(socket.room);
			roomMatrice[socket.room] = null;
		}		
		*/
		
		if(io.sockets.adapter.rooms[socket.room].length == 4){
			rooms[socket.room].push('matrice');
			rooms[socket.room]['matrice']= null;
		}	
		
		//io.sockets.in(socket.room).emit('connectRoom', socket.room, roomPlayers[socket.room][username][0], nbInRoom, colorOne[nbInRoom-1]);
		io.sockets.in(socket.room).emit('connectRoom', socket.room, rooms[socket.room]['player'][username][0], nbInRoom, colorOne[nbInRoom-1]);
		//io.sockets.in(socket.room).emit('initGame', widthArea, heightArea, positionX, positionY, colorOne, colorTwo, strokeArea, strokePlayer, sizePlayer);
		/*
		for(var i = 0; i < nbInRoom; i++){
			var name = rooms[socket.room]['player'][i];
			var pingId = rooms[socket.room]['player'][name][5];
			try{
				io.sockets.connected[pingId].emit('gameOver');
			}
			catch
			{
				io.sockets.in(socket.room).emit('connectRoom', socket.room, rooms[socket.room]['player'][username][0], nbInRoom, colorOne[nbInRoom-1]);
			}
		}
		*/
		
	});
	
	socket.on('initGame', function(room, username, direction){
		
		//var room = io.sockets.manager.roomClients[socket.id];
		/*
		if(roomMatrice[room] == null){
			roomMatrice[room] = generateMatrice();
		}		
		*/
		
		if(rooms[room]['matrice'] == null){
			rooms[room]['matrice'] = generateMatrice();
		}
		
		//console.log(roomMatrice[room][1][1]);
		/*
		if(roomPlayers[room][username] != undefined){
			roomPlayers[room][username][1] = direction;
		}
		*/
		
		if(rooms[socket.room]['player'][username] != undefined){
			rooms[socket.room]['player'][username][1] = direction;
		}
		
		io.sockets.in(room).emit('initGame', widthArea, heightArea, positionX, positionY, colorOne, colorTwo, strokeArea, strokePlayer, sizePlayer);
		
	});
	
	socket.on('startGame', function(room){
		//console.log(room);
		io.sockets.in(room).emit('startGame');
		var moveEvent = setInterval(function(){
			var sendMove = move(room);
			//console.log(sendMove);
			io.sockets.in(room).emit('move', sendMove["player1"], sendMove["player2"], sendMove["player3"], sendMove["player4"]);
			if(endGame(room)){
				clearInterval(moveEvent);
			}
			
		},100);
		
	});
	
	socket.on('newDir', function(room, username, dir){	
		rooms[room]['player'][username][1] = dir;
		
	});
	
	socket.on('leaveRoom', function(room){
		//console.log(rooms[room]['player']);
		if(rooms[room]['player'].length > 1){
			socket.leave(room);
			for(var i = 0; i < rooms[room]['player'].length; i++){				
				var name = rooms[room]['player'][i];
				if(rooms[room]['player'][name][5] == socket.id){
					rooms[room]['player'].splice(i, 1); 
				}								
			}
			
			//console.log(rooms[room]['player']);
		}
		else{		
			var it = 0;
			socket.leave(room);
			do{
				if (rooms[it] == room) {
					rooms.splice(it, 1); 
				}
				it++;
			}while(it < rooms.length-1);
		}

	});
	
	socket.on('disconnect', function() {
		
		//console.log(roomPlayer[socket.id]);
		try{
			var room = roomPlayer[socket.id][0];
			var username = roomPlayer[socket.id][1];
			var dir = rooms[room]['player'][username][1];
			//console.log(rooms[room]['player']);
			var nbInRoom = rooms[room]['player'].length;
			
			var it = 0;			
			do{
				if (roomPlayer[it] == socket.id) {
					roomPlayer.splice(it, 1); 
				}
				it++;			
			}while(it < roomPlayer.length-1);
						
			it = 0;	
			
			if(dir == "start"){
				// console.log("---nbInRoom---");
				// console.log(nbInRoom);
				if(nbInRoom == 1){
					do{
						if (rooms[it] == room) {
							rooms.splice(it, 1); 
						}
						it++;
					}while(it < rooms.length-1);
				}
				else{
					// console.log('Before');
					// console.log(rooms[room]['player']);
					do{					
						// console.log(rooms[room]['player'][it]);
						if (rooms[room]['player'][it] == username) {
							var toRemove = rooms[room]['player'][username];
							//console.log(toRemove);
							rooms[room]['player'].splice(it, 1); 
							
							rooms[room]['player'][username] = rooms[room]['player'][username].filter( function( el ) {
								return toRemove.indexOf( el ) < 0;
							});
							// console.log("During");
							// console.log(rooms[room]['player'])
							
							var newContentRoom = [];
							for(var i = 0; i < rooms[room]['player'].length;i++){
								var buffer = rooms[room]['player'][i];
								newContentRoom.push(buffer);
								newContentRoom[buffer] = [];
								for(var j = 0; j < rooms[room]['player'][buffer].length; j++)
									newContentRoom[buffer].push(rooms[room]['player'][buffer][j]);
							}
							// console.log("NewContent");
							// console.log(newContentRoom);
							rooms[room]['player'][username] = rooms[room]['player'] = newContentRoom;
							/*
							rooms[room]['player'] = rooms[room]['player'].filter( function( el ) {
							  return el.length != 0;
							} );
							*/
							
						}
						it++;
					}while(it < rooms[room]['player'].length-1);
					
					
					nbInRoom = rooms[room]['player'].length;	
					
					for(var i = 0; i <rooms[room]['player'].length; i++){
						var buffer = rooms[room]['player'][i];
						rooms[room]['player'][buffer][0] = "player"+(i+1);
						var id = rooms[room]['player'][buffer][5];
						try{
							console.log(colorOne[i])
							io.sockets.connected[id].emit('connectRoom', room, rooms[room]['player'][buffer][0], nbInRoom, colorOne[i]);
						}catch(error){
							console.log("User disconnect");
						}
						//io.sockets.in(room).emit('connectRoom', room, username, nbInRoom, colorOne[nbInRoom-1]);
					}
					
					console.log(rooms[room]['player']);
						
				}
			}				
			//console.log(rooms[room]['player'].length);
		}catch(error){
			console.log("Refresh without log");
		}
		
	});
	
});



server.listen(8080);


function generateMatrice(){
	
	var matrice = [];
	
	var xMaxWall = widthArea/movement;
	var yMaxWall = heightArea/movement;
	
	for(var i = 0; i < xMaxWall; i++){
		matrice[i] = [];
		for(var j = 0; j < yMaxWall; j++){
			if(i == 0 || i == yMaxWall-1){
				matrice[i][j] = 9;
			}
			else if(j == 0 || j == xMaxWall-1){
				matrice[i][j] = 9;
			}
			else{
				matrice[i][j] = 0;
			}
		}

	}

	matrice[initValueOne/movement][initValueOne/movement] = 1;
	matrice[initValueOne/movement][initValueTwo/movement] = 3;
	matrice[initValueTwo/movement][initValueTwo/movement] = 5;
	matrice[initValueTwo/movement][initValueOne/movement] = 7;
	
	return matrice;
}

function endGame(room){
	
	var nbDead = 0;
	var id;
	
	for(var i = 0; i < rooms[room]['player'].length; i++){
		var name = rooms[room]['player'][i];
		if(!rooms[room]['player'][name][4]){
			nbDead++;
		}
		else{
			id = rooms[room]['player'][name][5];
		}
	}
	
	console.log(id);
	
	if(nbDead == 3){
		
		io.sockets.connected[id].emit('winnerGame');
		
		io.of('/').in(room).clients((error, socketIds) => {
		  if (error) throw error;

		  socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(room));

		});

		return true;
	}
	else if(nbDead == 4){
		
		io.of('/').in(room).clients((error, socketIds) => {
		  if (error) throw error;

		  socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(room));

		});
		
		return true;
	}
	else{
		return false
	}
}

function move(room){
	
	var moveDid = [];
		
	//for(var i = 0; i < roomPlayers[room].length; i++){
	for(var i = 0; i < rooms[room]['player'].length; i++){
		
		var name = rooms[room]['player'][i];
		// var name = roomPlayers[room][i];
		// var player = roomPlayers[room][name][0];
		// var dir = roomPlayers[room][name][1];
		// var x = roomPlayers[room][name][2];
		// var y = roomPlayers[room][name][3];
		// var alive = roomPlayers[room][name][4];
		// var id = rovar name = roomPlayers[room][i];
		
		var player = rooms[room]['player'][name][0];
		var dir = rooms[room]['player'][name][1];
		var x = rooms[room]['player'][name][2];
		var y = rooms[room]['player'][name][3];
		var alive = rooms[room]['player'][name][4];
		var id = rooms[room]['player'][name][5];
		
		/*
		console.log(player);
		console.log(dir);
		console.log(x);
		console.log(y);
		console.log(alive);
		*/
		
		moveDid.push(player);
		moveDid[player] = [];
		
		if(alive){			
			if(player == "player1"){
				// roomMatrice[room][y/movement][x/movement] = 2;
				rooms[room]['matrice'][y/movement][x/movement] = 2;
			}
			else if(player == "player2"){
				// roomMatrice[room][y/movement][x/movement] = 4;				
				rooms[room]['matrice'][y/movement][x/movement] = 4;				
			}
			else if(player == "player3"){
				// roomMatrice[room][y/movement][x/movement] = 6;				
				rooms[room]['matrice'][y/movement][x/movement] = 6;				
			}
			else{
				// roomMatrice[room][y/movement][x/movement] = 8;
				rooms[room]['matrice'][y/movement][x/movement] = 8;
			}
			//-----------------------
			if(dir == "bottom"){
				// roomPlayers[room][name][3] += movement;
				rooms[room]['player'][name][3] += movement;
				y += movement;
			}
			else if(dir == "top"){
				// roomPlayers[room][name][3] -= movement;
				rooms[room]['player'][name][3] -= movement;
				y -= movement;
			}
			else if(dir == "right"){
				// roomPlayers[room][name][2] += movement;
				rooms[room]['player'][name][2] += movement;
				x += movement;
			}
			else{
				// roomPlayers[room][name][2] -= movement;
				rooms[room]['player'][name][2] -= movement;
				x -= movement;
			}
			
			//if(roomMatrice[room][y/movement][x/movement] != 0){
			if(rooms[room]['matrice'][y/movement][x/movement] != 0){
				// roomPlayers[room][name][4] = false;
				rooms[room]['player'][name][4] = false;
				alive = false;
				try{
					io.sockets.connected[id].emit('gameOver');
				}catch(error){
					console.log("User already disconnect");
				}
			}
			
			moveDid[player].push(x);
			moveDid[player].push(y);
			moveDid[player].push(alive);
			moveDid[player].push(dir);
			
		}
	}
	//console.log(moveDid)
	return moveDid;
	
}
