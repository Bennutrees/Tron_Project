import socket from "./socket.js";

socket.on('message', function(message) {
    if(message=="1"){
        player = document.getElementById('pseudo').value;
        alert("MDR");
    }
    else{
        alert(message);
    }
});

document.getElementById('send').onclick = function() {
    alert("LOL");
    socket.emit('message', document.getElementById('pseudo').value);        
};