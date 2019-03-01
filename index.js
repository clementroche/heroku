const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket,id) => {
    console.log('Client connected',id);
    socket.join(id);
    io.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

http.listen(port, () => {
    console.log('listening on *:80');
});

