const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    // let client = new Client(socket)
    let clientID = socket.id
    let roomID = socket.handshake.query.room || undefined
    let type = socket.handshake.query.type || undefined
    console.log('Client connected', 'id: ' + clientID, 'room: ' + roomID, 'type: ' + type);

    socket.type = type

    if(!io.sockets.adapter.rooms[roomID]) {
        socket.join(roomID)
    }
    else if(io.sockets.adapter.rooms[roomID].length < 2) {
        socket.join(roomID)
    }
        // console.log(io.sockets.adapter.rooms[roomID].sockets[0].type);

    if(io.sockets.adapter.rooms[roomID].length > 1) {
        io.to(roomID).emit('synchro',true)
        console.log(roomID,"sychro OK")
    }
    
     
    io.on('disconnect', () => {
        console.log('Client disconnected')
        socket.leave(roomID)
        //si le desktop se deconnecte -> supprimer la room
        io.to(roomID).emit('desynchro',true)
        console.log(roomID,"desychro")
    });
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

http.listen(port, () => {
    console.log('listening on *:80');

});