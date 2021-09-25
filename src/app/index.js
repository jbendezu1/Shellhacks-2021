const WebSocket = require('ws');
const port = 8080;
const wss = new WebSocket.Server({port: port});

// Creates a websocket endpoint that takes in a user's move choice
wss.on('connection', ws=>{

    ws.on('message', message => {
        decideMove(message);
        console.log(`Received message => ${message}`);
    })
    ws.send('Hello! Message From Server!');
})

// Function calls a python script with user's chosen move as a parameter
// It is up to the AI to store info to learn 
// and up to the front-end to store info to display
function decideMove(move){
    // using spawn instead of exec, prefer a stream over a buffer to avoid maxBuffer issue
    var spawn = require("child_process").spawn;
    var process = spawn('python', ["./d_alembert.py",move]);
    process.stdout.on('data', (data)=>resizeBy.send(data.toString())
    )
}