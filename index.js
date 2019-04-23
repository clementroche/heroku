const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 3000;

function createID() {
  return Math.random()
    .toString(36)
    .substr(2, 9);
}

io.on("connection", socket => {
  console.log("connected", socket.id);
  console.log(socket.handshake.query.device);
  if (socket.handshake.query.device === "desktop") {
    let id = createID();
    socket.join(id);
    io.to(socket.id).emit("room created", id);
  } else if (socket.handshake.query.device === "mobile") {
    let id = socket.handshake.query.roomID;
    socket.join(id);
    io.to(socket.id).emit("room joined", id);
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    io.emit("debug", socket.rooms);
    console.log(socket.rooms);
    socket.leave();
  });
});

setInterval(() => io.emit("time", new Date().toTimeString()), 1000);

http.listen(port, () => {
  console.log("listening on *:3000");
});
