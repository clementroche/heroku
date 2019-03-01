const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    // let client = new Client(socket)
    console.log('Client connected',socket.id,socket.handshake.query.room);
    // io.on('room', (id) => socket.join(id))
    io.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

http.listen(port, () => {
    console.log('listening on *:80');
});

class Client {
    constructor(socket,type) {
        this.socket = socket,
        this.type = type,
        this.id = ID()
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
    
    // joinClient(client,type) {
    //     if(type === 'desktop' && this.clients.desktop === undefined) {
    //         this.desktop = new Client(socket,'desktop')
    //     }

    //     if(type === 'mobile' && this.clients.mobile === undefined) {
    //         this.desktop = new Client(socket,'mobile')
    //     }
    // }
}

function ID() {
    return (
      "_" +
      Math.random()
        .toString(36)
        .substr(2, 9)
    );
  }

