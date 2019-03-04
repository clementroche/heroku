const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

let rooms = {

}

let clients = {

}

io.on('connection', (socket) => {
    console.log('connected')
    io.emit('debug',{rooms: Object.keys(rooms), clients: Object.keys(clients)})
    clients[socket.id] = new Client(socket, socket.handshake.query.type || undefined)

    socket.on('create room', (params) => {
        if (params.type === 'desktop') {
            rooms[params.id] = new Room(params.id)
            clients[socket.id].join(params.id)
        }
    });

    socket.on('join room', (params) => {
        if (params.type === 'mobile') {
            if (rooms[params.id] && rooms[params.id].desktop !== undefined && rooms[params.id].mobile === undefined) {
                clients[socket.id].join(params.id)
            } else {
                io.to(socket.id).emit('error', "room doesn't exist or is full")
            }
        } else if(params.type === 'desktop') {
            //
        }
    })


    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id)
        clients[socket.id].leave()
        clients[socket.id] = undefined
    });
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

http.listen(port, () => {
    console.log('listening on *:3000');

});

class Client {
    constructor(socket, type) {
        this.socket = socket
        this.type = type
        this.room = undefined
    }

    get id() {
        return this.socket.id
    }

    join(id) {
        this.socket.join(id)
        rooms[id][this.type] = this
        this.room = rooms[id]
        if(this.room.isSynchro) {
            this.room.synchronisation()
        }
        console.log(this.type, ' joined room ', id)
    }

    leave() {
        if(this.room !== undefined) {
            this.room.deSynchronisation()
            this.socket.leave(this.room.id)
            rooms[this.room.id][this.type] = undefined
            this.room = undefined
        }
    }
}

class Room {
    constructor(id) {
        this.id = id
        // this.room = io.sockets.adapter.rooms[this.id]
        this.desktop = undefined
        this.mobile = undefined
        console.log('room created', this.id)
    }

    get isSynchro() {
        return Boolean(this.desktop !== undefined && this.mobile !== undefined)
    }

    synchronisation() {
        io.in(this.id).emit('synchronisation', {
            desktop: this.desktop.id,
            mobile: this.mobile.id
        })
    }

    deSynchronisation() {
        console.log(this.id)
        io.in(this.id).emit('desynchronisation')
        if(this.desktop === undefined && this.mobile === undefined) {
            console.log(this.id,'deleted')
            rooms[this.id] = undefined
        }
    }

}