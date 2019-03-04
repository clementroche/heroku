const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

let rooms = {

}

let clients = {

}

io.on('connection', (socket) => {
    // let client = new Client(socket)
    // socket.clientID = socket.id
    // socket.roomID = socket.handshake.query.room || undefined
    // socket.type = socket.handshake.query.type || undefined
    // console.log('Client connected', 'id: ' + socket.id, 'room: ' + socket.roomID, 'type: ' + socket.type);
    console.log('connected')
    // console.log(socket.handshake.query.type, socket.handshake.query.id)
    clients[socket.id] = new Client(socket,socket.handshake.query.type || undefined)

    socket.on('create room',(params)=>{
        if(params.type === 'desktop') {
            rooms[params.id] = new Room(params.id)
            clients[socket.id].join(params.id)
        }
    });

    socket.on('join room',(params)=>{
        if(params.type === 'mobile') {
            if(rooms[params.id] && rooms[params.id].isSynchro === false) {
                clients[socket.id].join(params.id)
                io.emit('debug',{desktop:rooms[params.id].desktop.id,mobile:rooms[params.id].mobile.id})
            }
        }
    })
        




    // if (io.sockets.adapter.rooms[roomID] && socket.type==="desktop") {
    //     socket.join(roomID)
    // }

    // var clients = io.sockets.adapter.rooms[roomID].sockets;

    //to get the number of clients
    // var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
    // if (numClients)

    // for (var clientId in clients) {

        //this is the socket of each client in the room.
        // var clientSocket = io.sockets.connected[clientId];
        // console.log(clientSocket)

        //you can do whatever you need with this
        //  clientSocket.emit('new event', "Updates");

    // }

    // if(!io.sockets.adapter.rooms[roomID]) {
    //     socket.join(roomID)
    // }
    // else if(io.sockets.adapter.rooms[roomID].length < 2) {
    //     socket.join(roomID)
    // }
        // console.log(io.sockets.adapter.rooms[roomID].sockets[0].type);

    // if(io.sockets.adapter.rooms[roomID].length > 1) {
    //     io.to(roomID).emit('synchro',true)
    //     console.log(roomID,"sychro OK")
    // }


    socket.on('disconnect', (socket) => {
        // console.log('Client disconnected')
        clients[socket.id].leave()
        // //si le desktop se deconnecte -> supprimer la room
        // io.to(roomID).emit('desynchro', true)
        // console.log(roomID, "desychro")
    });
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

http.listen(port, () => {
    console.log('listening on *:3000');

});

class Client {
    constructor(socket,type) {
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
        console.log(this.type,' joined room ',id)
    }

    leave() {
        this.socket.leave(this.room.id)
        rooms[this.room.id][this.type] = undefined
        this.room = undefined
    }
}

class Room {
    constructor(id) {
        this.id = id
        this.room = io.sockets.adapter.rooms[this.id]
        this.desktop = undefined
        this.mobile = undefined
        console.log('room created',this.id)
    }

    get isSynchro() {
        return Boolean(this.desktop !== undefined && this.mobile !== undefined)
    }

}