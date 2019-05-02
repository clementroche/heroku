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
  socket._room = socket.handshake.query.roomID;
  console.log(socket._device,socket._room);
  if (socket._device === "desktop") {
    //si desktop

    if(socket._room != 'null' || socket._room != null) {
      let id = socket._room

      socket.join(id);
      rooms[id].desktop = socket;
      io.to(socket.id).emit("room joined", id);

    } else {
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
        rooms[id].desktop = socket;
        io.to(socket.id).emit("room created", id);
      }
    }
  } else if (socket._device === "mobile") {
    //si mobile

    let id = socket._room;

    //si room existe
    //&&
    //si room ne contient pas de mobile
    if (!!rooms[id] && !rooms[id].mobile) {
      // -> join la room
      socket.join(id);
      socket._room = id;
      rooms[id].mobile = socket;
      io.to(socket.id).emit("room joined", id);
    }
  }

  if (socket._device === "mobile" || socket._device === "desktop") {
    if (
      !!socket._room &&
      !!rooms[socket._room].desktop &&
      !!rooms[socket._room].mobile
    ) {
      console.log(socket._room, "room synchro");
      io.in(socket._room).emit("synchro", true);
    }
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    //si socket est dans une room
    if (!!socket._room) {
      rooms[socket._room][socket._device] = null;
      io.in(socket._room).emit("synchro", false);
      if (!rooms[socket._room].desktop && !rooms[socket._room].mobile) {
        delete rooms[socket._room];
      }
    }
    socket.leave();
  });
});

setInterval(() => io.emit("time", new Date().toTimeString()), 1000);

http.listen(port, () => {
  console.log("listening on *:3000");
});
