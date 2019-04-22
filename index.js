const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000

io.on('connection', (socket) => {
    console.log('connected', socket.id)
    console.log(socket.handshake.query.device)

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id)
        socket.leave()
    });
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

http.listen(port, () => {
    console.log('listening on *:3000');

});