//#region HTTP & Socket Connexion
const app = require("express")();
const http = require("http");

import { encode as btoa } from "base-64";
const fetch = require("node-fetch");

const hostname = "beta.projectheberg.fr";
const port = 20268;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const io = require("socket.io")(server, {
  cors: true,
  origins: ["*"],
});
//#endregion

interface Room {
  ownerId: string;
  options: any | undefined;
  users: string[];
}

const rooms = new Map<string, Room>();

//#region  Room Manager
const generateRandomRoomId = (length: number): string => {
  let id;
  do {
    let code = [];
    var characters = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      code.push(
        characters.charAt(Math.floor(Math.random() * charactersLength))
      );
    }
    id = code.join("");
  } while (existRoom(id));
  return id;
};

/**
 * Create a new room and add the socket inside
 */
const createNewRoom = (socket: any, options?: any): string => {
  let roomId = generateRandomRoomId(6);
  let room = { ownerId: socket.id, options: options, users: [] };
  rooms.set(roomId, room);
  return roomId;
};

/**
 * Add the socket inside the room
 */
const joinRoom = (socket: any, roomId: string) => {
  let room = rooms.get(roomId);
  if (room) {
    room.users = [...room.users, socket.id];
  }
};

/**
 * Retourne si la salle existe
 */
const existRoom = (roomId: string): boolean => {
  return rooms.has(roomId);
};

/**
 * Retourne si l'utiliasteur a une salle
 */
const hasRoom = (socket: any): boolean => {
  return getUserRoom(socket) != undefined;
};

const getUserRoom = (socket: any): string | undefined => {
  let finalRoomId = undefined;
  rooms.forEach((room: Room, roomId: string, map: any) => {
    // Is the owner ?
    if (room.ownerId == socket.id) {
      finalRoomId = roomId;
    }
    // Is in users of the room ?
    if (
      room.users.filter((userId: string) => {
        return userId == socket.id;
      }).length > 0
    ) {
      finalRoomId = roomId;
    }
  });
  return finalRoomId;
};

/**
 * Détruit une salle
 */
const destroyRoom = (roomId: string) => {
  if (existRoom(roomId)) {
    let room = rooms.get(roomId);
    io.to(room?.ownerId).emit("leaveRoom", { reason: "Destroyed " });

    room?.users.forEach((userId: string) => {
      io.to(userId).emit("leaveRoom", { reason: "Destroyed " });
    });
    rooms.delete(roomId);
  }
};

/**
 * Leave is room (or destroy if he's the owner)
 */
const leaveUserRoom = (socket: any) => {
  let roomId = getUserRoom(socket);
  if (roomId) {
    let room = rooms.get(roomId);
    if (room?.ownerId == socket.id) {
      destroyRoom(roomId);
    } else {
      leaveRoom(socket, roomId);
    }
  } else {
    socket.emit("leaveRoom", { reason: "Unkown room" });
  }
};

/**
 * Quitte une salle
 */
const leaveRoom = (socket: any, roomId: string) => {
  let room = rooms.get(roomId);
  if (room) {
    room.users = room.users.filter((userId: string) => {
      return userId != socket.id;
    });
  }
  socket.emit("leaveRoom", { reason: "Leaved" });
};

const sendToRoom = (roomId: string, message: string, data: any) => {
  let room = rooms.get(roomId);
  if (room) {
    io.to(room.ownerId).emit(message, { ...data, isOwner: true });
    room.users.forEach((userId: string) => {
      io.to(userId).emit(message, { ...data, isOwner: false });
    });
  }
};
//#endregion

io.on("connection", (socket: any) => {
  // Infos de l'utilisateur du socket
  console.log("[+] New connexion !");
  socket.on("createNewRoom", (_: {}) => {
    // Leave his room if he has
    leaveUserRoom(socket);

    let roomId = createNewRoom(socket); // TODO : Options
    socket.emit("roomCreated", { roomId: roomId });
  });

  socket.on("joinRoom", (data: { roomId: string }) => {
    let roomId = data.roomId;
    if (!existRoom(roomId)) {
      socket.emit("roomDoesNotExist", {});
      return;
    }
    joinRoom(socket, roomId);
    socket.emit("roomJoined", { roomId: roomId });
  });

  socket.on("leaveRoom", (data: {}) => {
    leaveUserRoom(socket);
  });

  socket.on("addMusic", (data: { musicId: string }) => {
    if (hasRoom(socket)) {
      let roomId = getUserRoom(socket);
      sendToRoom(roomId, "addMusic", data);
    }
  });

  socket.on("disconnect", (data: {}) => {
    leaveUserRoom(socket);
    console.log("[-] Disconnexion !");
  });
});

//#region HTTP Request Manager
// const cors = require("cors");
// require("../manageRequest.ts")(app);

// app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const clientId = "9964dec0f948404eb6b0285252a65f1d";
const clientSecret = "a0c98b0ef7f84369a72495e627e5fb50";

app.get("/callback", (req, res) => {
  if (req.query.code) {
    const auth = btoa(`${clientId}:${clientSecret}`);
    const code = req.query.code;
    const socketId = req.query.state;
    const redirect_uri = encodeURIComponent(
      `http://${hostname}:${port}/callback`
    );
    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`,
    })
      .then((res) => res.json())
      .then((json) => {
        const tokens = {
          token: json.access_token,
          tokenExpiration: new Date().getTime() + json.expires_in * 1000,
          refreshToken: json.refresh_token,
        };
        io.to(socketId).emit("spotifyConnexionResponse", tokens);
      })
      .catch((err) => console.log(err));
  }
  res
    .status(200)
    .send(
      "Vous avez lié votre compte Spotify à Comunify. Vous pouvez retourner sur l'application. 🚀"
    );
});

//#endregion
