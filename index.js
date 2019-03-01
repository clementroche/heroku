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

    socket.join(roomID)
    // console.log(io.sockets.clients(roomID))
     
    io.on('disconnect', () => {
        console.log('Client disconnected')
        socket.leave(roomID)
        //si le desktop se deconnecte -> supprimer la room
    });
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

http.listen(port, () => {
    console.log('listening on *:80');

});