const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 3000;

function createID() {
  return Math.random()
    .toString(36)
    .substr(2, 9);
}

let rooms = {};

io.on("connection", socket => {
  console.log("connected", socket.id);
  socket._device = socket.handshake.query.device;
  console.log(socket._device);
  if (socket._device === "desktop") {
    //si desktop

    let id = createID();

    //si room n'existe pas ou
    //||
    //si room ne contient pas de desktop
    if (!rooms[id]) {
      // -> créé la room
      socket.join(id);
      socket._room = id;
      rooms[id] = {
        desktop: null,
        mobile: null
      };
      io.to(socket.id).emit("room created", id);
    }
  } else if (socket._device === "mobile") {
    //si mobile

    let id = socket.handshake.query.roomID;

    //si room existe
    //&&
    //si room ne contient pas de mobile
    if (!!rooms[id] && !rooms[id].mobile) {
      // -> join la room
      socket.join(id);
      socket._room = id;
      io.to(socket.id).emit("room joined", id);
    }
  }

  if (socket._device === "mobile" || socket._device === "desktop") {
    if (
      !!socket._room &&
      !!room[socket_room].desktop &&
      !!room[socket_room].mobile
    ) {
      io.in(socket._room).emit("synchro", true);
    }
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    //si socket est dans une room
    if (!!socket._room) {
    }
    socket.leave();
  });
});

setInterval(() => io.emit("time", new Date().toTimeString()), 1000);

http.listen(port, () => {
  console.log("listening on *:3000");
});
