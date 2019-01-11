
var pseudo;
var numPlayer = null;
var nbInRoom = 0;
var colorPlayer = null;
var roomGame = null;
var gameStart = false;

var players = [];
var svg = document.getElementById('svg');

function wall(player){
	
	var wall = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
	
	var xWall = player.getAttribute("x");
	var yWall = player.getAttribute("y");
	
	if(player.getAttribute('id') == "player1"){
		wall.setAttribute('id','wallOne');
	}
	else if(player.getAttribute('id') == "player2"){
		wall.setAttribute('id','wallTwo');
	}
	else if(player.getAttribute('id') == "player3"){
		wall.setAttribute('id','wallThree');
	}
	else{
		wall.setAttribute('id','wallFour');
	}
		
    wall.setAttribute('x',xWall.toString());
    wall.setAttribute('y',yWall.toString());
	
    wall.setAttribute('width',"10");
    wall.setAttribute('height',"10");
	
	wall.setAttribute('fill', player.getAttribute("fill"));
	
    svg.append(wall);
	
}

function generateArea(widthArea, heightArea, positionX, positionY, sizePlayer, colorOne, colorTwo, strokePlayer, strokeArea){
	
	if(players.length == 0){
		var newItem = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
					
		newItem.setAttribute('x',0);
		newItem.setAttribute('y',0);
		
		newItem.setAttribute('width', widthArea);
		newItem.setAttribute('height', heightArea);
		
		newItem.setAttribute('fill', "white");
		newItem.setAttribute('stroke', "black");
		newItem.setAttribute("stroke-width", strokeArea);
		
		newItem.setAttribute('id','battlearea');
		
		//battleArea = newItem;
		
		svg.append(newItem);

		for(var i = 1; i <= 4; i++){
			
			newItem = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
							
			newItem.setAttribute('x',positionX[i-1]);
			newItem.setAttribute('y',positionY[i-1]);
			
			newItem.setAttribute('width', sizePlayer);
			newItem.setAttribute('height', sizePlayer);
			
			newItem.setAttribute('fill', colorOne[i-1]);
			newItem.setAttribute('stroke', colorTwo[i-1]);
			newItem.setAttribute("stroke-width", strokePlayer);
			
			newItem.setAttribute('id','player'+i);
			
			players.push(newItem);
			
			svg.append(newItem);		
			
		}
	}
		
}


window.addEventListener("keydown", newDir, false);


function newDir(keyP){
	if(gameStart){
		
		var dir;
		
		if(keyP.keyCode == 68){ //d
			dir = "right";
		}
		else if(keyP.keyCode == 81){ //q
			dir = "left";
		}
		else if(keyP.keyCode == 90){  //z
			dir = "top";
		}
		else if(keyP.keyCode == 83){  //s
			dir = "bottom";
		}	
		
		socket.emit('newDir', roomGame, pseudo, dir);
	}
}


var socket = io.connect("http://localhost:8080");



document.getElementById('send').onclick = function() {
	pseudo = document.getElementById('pseudo').value;
	socket.emit('newGame', pseudo, socket.id);        
};

socket.on('connectRoom', function(room, player, info, color){
	
	if((numPlayer == null && colorPlayer == null) || nbInRoom > info){
		numPlayer = player;
		colorPlayer = color;
		nbInRoom = info;
	}	
	console.log(color);
	roomGame = room;
	
	$('body').loading({
		start: true,
		theme: colorPlayer,
		message: nbInRoom+"/4 players / You're the "+colorPlayer+" character"
	});

	if(parseInt(info) == 4){

		setTimeout(function(){
			
			$('body').loading({
				start: false,
				message: info+"/4 players"
			});
			
			var direction;
			
			if(numPlayer == "player1"){
				direction = "bottom";
				
			}
			else if(numPlayer == "player2"){
				direction = "right";			
			}
			else if(numPlayer == "player3"){
				direction = "top";			
			}
			else{
				direction = "left";			
			}
			socket.emit('initGame', roomGame, pseudo, direction);		
		}, 5000);		
	}
	
});

socket.on('initGame', function(widthArea, heightArea, positionX, positionY, colorOne, colorTwo, strokeArea, strokePlayer, sizePlayer){
	
	generateArea(widthArea, heightArea, positionX, positionY, sizePlayer, colorOne, colorTwo, strokePlayer, strokeArea);
	
	var timeleft = 3;
	var countdown = setInterval(function(){
		$('body').loading({
			start: true,
			message: timeleft
		});		
		timeleft -= 1;
		if(timeleft <= -2){
			$('body').loading({
				start: false,
				message: timeleft
			});
			clearInterval(countdown);
			if(numPlayer == "player1"){
				socket.emit('startGame', roomGame);
			}
		}
	},1500);
	
});

socket.on('move', function(playerOne,playerTwo,playerThree,playerFour){
	
	var infoPlayers = [];
	
	infoPlayers[0] = playerOne;
	infoPlayers[1] = playerTwo;
	infoPlayers[2] = playerThree;
	infoPlayers[3] = playerFour;
	
	for(var i = 0; i < players.length; i++){		
		if(infoPlayers[i][2]){
			wall(players[i]);
			players[i].setAttribute("x", infoPlayers[i][0]);
			players[i].setAttribute("y", infoPlayers[i][1]);
		}		
	}	
});

socket.on('startGame', function(){
	gameStart = true;
});

socket.on('gameOver',function(){
	
	$('body').loading({
		start: true,
		theme: colorPlayer,
		message: "You died - Click to leave the game",
		onClick: function(){			
			socket.emit('leaveRoom', roomGame);	
			location.reload();
		}
	});

});


socket.on('winnerGame',function(){
	
	$('body').loading({
		start: true,
		theme: colorPlayer,
		message: "You Win - Click to leave the game",
		onClick: function(){			
			socket.emit('leaveRoom', roomGame);	
			location.reload();
		}
	});

});