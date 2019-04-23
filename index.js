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
  socket._device = socket.handshake.query.device;
  console.log(socket._device);
  if (socket._device === "desktop") {
    //si desktop -> créé la room

    //TODO
    //si room n'existe pas ou
    // ||
    //si room ne contient pas de desktop
    let id = createID();
    socket.join(id);
    socket._room = id;
    io.to(socket.id).emit("room created", id);
  } else if (socket._device === "mobile") {
    //si mobile -> join la room

    //TODO
    //si room existe
    // &&
    //si room ne contient pas de mobile
    let id = socket.handshake.query.roomID;
    socket.join(id);
    socket._room = id;
    io.to(socket.id).emit("room joined", id);
  }

  io.emit("debug", socket.adapter.rooms);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    io.emit("debug", socket._room);
    socket.leave();
  });
});

setInterval(() => io.emit("time", new Date().toTimeString()), 1000);

http.listen(port, () => {
  console.log("listening on *:3000");
});
