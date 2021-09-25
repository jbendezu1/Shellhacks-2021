const WebSocket = require('ws');
const url = 'ws://localhost:8080';
const connection = new WebSocket(url);
const util = require('util');

connection.onopen = ()=>{
    connection.send('Message from Client')
}

connection.onerror = (err)=>{
    console.log(`Websocket error: ${util.inspect(err)}`);
}

connection.onmessage = (e) =>{
    console.log("SENT");
}