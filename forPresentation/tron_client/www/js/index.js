//Informations client

var socket = io.connect("http://localhost:8080");
var pseudo;
var numPlayer = null;
var nbInRoom = 0;
var colorPlayer = null;
var roomGame = null;
var gameStart = false;
var firstLoadingScreen;

//Liste des joueurs
var players = [];
//Zone SVG de la page
var svg = document.getElementById('svg');
var highscore = document.getElementById('highscore')

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
		
		//Définition des fonctions du boutons de connexion/deconnexion
		document.getElementById('send').onclick = function() {
			$('highscore').empty();
            if(document.getElementById('send').value == "Connexion"){
				//Demande de connexion au serveur
               socket.emit('message', document.getElementById('pseudo').value);
            }
            else if(document.getElementById('send').value == "Déconnexion"){                
                //document.getElementById('send').setAttribute("value", 'Connexion');
                //document.getElementById('pseudo').disabled = false;
				//document.getElementById('game').disabled = true;
				//Demande de déconnection au serveur
                socket.emit('deconnexion', pseudo);
            }      
        };
        
        document.getElementById('game').onclick = function() {      
			//Demande d'accès à une room pour jouer
			$('highscore').empty();     
			firstLoadingScreen = true;
	        socket.emit('newGame', pseudo, socket.id);       
		};
		
		document.getElementById('highscoreBtn').onclick = function() {      
			//Demande la liste des scores   
			//alert('Click');   
			while (highscore.lastChild) {
				highscore.removeChild(highscore.lastChild);
			}
	        socket.emit('highscore');       
		};
        
    }
};

app.initialize();

//Construction du mur derrière les joueurs
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

//Génération de l'arène avec les données reçues du serveur
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

//Listener de l'event pour la pression de touche du clavier
window.addEventListener("keydown", newDir, false);

//Listener de l'event de swipe sur le téléphone
window.addEventListener('load', function(){
    if(gameStart){        
		var dir;
        var el = document.body;
        swipedetect(el, function(swipedir){
            if (swipedir == 'left'){
                //alert('left')
                dir = "left";
            }
            else if(swipedir == 'right'){
                //alert('right')
                dir = "right";
            }
            else if(swipedir == 'up'){
                //alert('up')
                dir = "top";
            }
            else if(swipedir == 'down'){
                //alert('down')
                dir = "bottom";
            }
            
            socket.emit('newDir', roomGame, pseudo, dir);

        })
    }
}, false)

//Fonction servant à envoyer le changement de direction du joueurs
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


//Reception de la réponse à la demande de connexion
socket.on('message', function(message) {
    if(message=="1"){
        pseudo = document.getElementById('pseudo').value;
        document.getElementById('send').setAttribute("value", 'Déconnexion');
        document.getElementById('pseudo').disabled = true;
        document.getElementById('game').disabled = false; 
        //alert("Connected " + message);
    }
    else{
        alert(message);
    }
});

//Reception de la réponse à la demande de connexion
socket.on('deconnexion', function() {
    document.getElementById('send').setAttribute("value", 'Connexion');
	document.getElementById('pseudo').disabled = false;
	document.getElementById('game').disabled = true;		
    document.getElementById('pseudo').value = "";		
    document.getElementById('pseudo').placeholder = "Nickname";
});

//Receptpion de la connexion à la room
socket.on('connectRoom', function(room, player, info, color){

	//Si le joueurs vient de ce connecter à la room ou un joueurs c'est déconnecter 
	if((numPlayer == null && colorPlayer == null) || nbInRoom > info){
		numPlayer = player;
		colorPlayer = color;
		nbInRoom = info;
	}	
	
	roomGame = room;
	//Evite un double envoies du message leaveRoom
	var execution = 0;
	/*if(loadingScreen){
		//Affiche la fenetre d'attente
		console.log('First');
		$('html').loading({
			stoppable: true,
			theme: colorPlayer,
			message: nbInRoom+"/4 players / You're the "+colorPlayer+" character. Click to leave the room.",
			onStop: function(){
				console.log('stop');
			},
			onClick: function(){
				console.log('click');
				loadingScreen = true;
				socket.emit('leaveRoom', roomGame, pseudo);	
			}		
		});
		loadingScreen = false;
	}
	else{*/
		//$('html').loading('stop');
		$('html').loading({
			start: true,
			theme: colorPlayer,
			message: nbInRoom+"/4 players / You're the "+colorPlayer+" character. Click to leave the room.",
			onClick: function(){
				console.log('click');
				$('html').loading('stop');
				if(firstLoadingScreen){
					socket.emit('leaveRoom', roomGame, pseudo);
					firstLoadingScreen = false;
				}
			}		
		});
	//}
	//Si la room est complète
	if(parseInt(info) == 4){
		//Attente de 5 Sec
		setTimeout(function(){
			
			$('html').loading({
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
			//Envoi des information pour le début de la partie
			socket.emit('initGame', roomGame, pseudo, direction);		
		}, 5000);		
	}
	
});

//Reception des info pour le début du jeu
socket.on('initGame', function(widthArea, heightArea, positionX, positionY, colorOne, colorTwo, strokeArea, strokePlayer, sizePlayer){
	//Créer le SVG
	generateArea(widthArea, heightArea, positionX, positionY, sizePlayer, colorOne, colorTwo, strokePlayer, strokeArea);
	//Lance à compte à rebours
	var timeleft = 3;
	var countdown = setInterval(function(){
		$('html').loading({
			start: true,
			message: timeleft
		});		
		timeleft -= 1;
		if(timeleft <= -2){
			$('html').loading({
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

//reception d'un message move
socket.on('move', function(playerOne,playerTwo,playerThree,playerFour){
	
	//Déplace les joueurs sur le SVG
	var infoPlayers = [];
	
	infoPlayers[0] = playerOne;
	infoPlayers[1] = playerTwo;
	infoPlayers[2] = playerThree;
    infoPlayers[3] = playerFour;
    /*
    console.log(playerOne);	
    console.log(playerTwo);
    console.log(playerThree);
    console.log(playerFour);
	*/
	for(var i = 0; i < players.length; i++){		
		if(infoPlayers[i][2]){
			//Génére un mur derrière eux
			wall(players[i]);
			players[i].setAttribute("x", infoPlayers[i][0]);
			players[i].setAttribute("y", infoPlayers[i][1]);
		}		
	}	
});

//Début de la partie
socket.on('startGame', function(){
	gameStart = true;
});

//Reception du message de GameOver
socket.on('gameOver',function(){
	//Affiche une fenetre pour désigner une défaite
	//var execution = 0;
	players = [];
	numPlayer = null;
	nbInRoom = 0;
	colorPlayer = null;
	roomGame = null;
	gameStart = false;
	$('html').loading({
		start: true,
		theme: colorPlayer,
		message: "You died - Click to leave the game",
		onClick: function(){
			$('html').loading({
				start: false
			});	
			while (svg.lastChild) {
				svg.removeChild(svg.lastChild);
			}
		}
	});

});

//Reception du message de victoire
socket.on('winnerGame',function(){
	//Affiche une fenêtre pour désigner une victoire
	//var execution = 0;
	players = [];
	numPlayer = null;
	nbInRoom = 0;
	colorPlayer = null;
	roomGame = null;
	gameStart = false;
	gameStart = false;
	$('html').loading({
		start: true,
		theme: colorPlayer,
		message: "You Win - Click to leave the game",
		onClick: function(){		
			while (svg.lastChild) {
				svg.removeChild(svg.lastChild);
			}
		}
	});

});

//Reception du message de victoire
socket.on('highscoreRes',function(info){
	//Affiche une fenêtre pour désigner une victoire
	var div = document.getElementById('highscore');
	var ul = document.createElement("ul");
	for(var i = 0; i < info.length; i++){
		//contentLi = pseudo[i] + " - " + win[i];
		//li.appendChild(info[i]);	
		var li = document.createElement("li");
		li.innerHTML = info[i];
		ul.appendChild(li);
	}
	div.appendChild(ul);
});
