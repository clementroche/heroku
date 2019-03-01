const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

const rooms = {}


io.on('connection', (socket) => {
    // let client = new Client(socket)
    let clientID = socket.id
    let roomID = socket.handshake.query.room || undefined
    let type = socket.handshake.query.type || undefined
    console.log('Client connected','id: '+clientID,'room: '+roomID,'type: '+type);
    // io.sockets.in(roomID)
    socket.join(roomID)
    io.on('disconnect', () => {
        console.log('Client disconnected')
        socket.leave(roomID)
    });
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

http.listen(port, () => {
    console.log('listening on *:80',req.query.id);
    
});

class Client {
    constructor(socket,type) {
        this.socket = socket
        this.type = type
    }
}

class Room {
    constructor(id) {
        this.id = id
        this.clients = {
            desktop: undefined,
            mobile: undefined
        }
    }
}

function ID() {
    return (
      "_" +
      Math.random()
        .toString(36)
        .substr(2, 9)
    );
  }

