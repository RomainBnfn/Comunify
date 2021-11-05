"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
//#region HTTP & Socket Connexion
var app = require("express")();
var http = require("http");
var base_64_1 = require("base-64");
var fetch = require("node-fetch");
var hostname = "beta.projectheberg.fr";
var port = 20268;
var server = http.createServer(app);
server.listen(port, function () {
    console.log("Server running at http://" + hostname + ":" + port + "/");
});
var io = require("socket.io")(server, {
    cors: true,
    origins: ["*"]
});
var rooms = new Map();
//#region  Room Manager
var generateRandomRoomId = function (length) {
    var id;
    do {
        var code = [];
        var characters = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            code.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
        }
        id = code.join("");
    } while (existRoom(id));
    return id;
};
/**
 * Create a new room and add the socket inside
 */
var createNewRoom = function (socket, options) {
    var roomId = generateRandomRoomId(6);
    var room = { ownerId: socket.id, options: options, users: [] };
    rooms.set(roomId, room);
    return roomId;
};
/**
 * Add the socket inside the room
 */
var joinRoom = function (socket, roomId) {
    var room = rooms.get(roomId);
    if (room) {
        room.users = __spreadArrays(room.users, [socket.id]);
    }
};
/**
 * Retourne si la salle existe
 */
var existRoom = function (roomId) {
    return rooms.has(roomId);
};
/**
 * Retourne si l'utiliasteur a une salle
 */
var hasRoom = function (socket) {
    return getUserRoom(socket) != undefined;
};
var getUserRoom = function (socket) {
    var finalRoomId = undefined;
    rooms.forEach(function (room, roomId, map) {
        // Is the owner ?
        if (room.ownerId == socket.id) {
            finalRoomId = roomId;
        }
        // Is in users of the room ?
        if (room.users.filter(function (userId) {
            return userId == socket.id;
        }).length > 0) {
            finalRoomId = roomId;
        }
    });
    return finalRoomId;
};
/**
 * Détruit une salle
 */
var destroyRoom = function (roomId) {
    if (existRoom(roomId)) {
        var room = rooms.get(roomId);
        io.to(room === null || room === void 0 ? void 0 : room.ownerId).emit("leaveRoom", { reason: "Destroyed " });
        room === null || room === void 0 ? void 0 : room.users.forEach(function (userId) {
            io.to(userId).emit("leaveRoom", { reason: "Destroyed " });
        });
        rooms["delete"](roomId);
    }
};
/**
 * Leave is room (or destroy if he's the owner)
 */
var leaveUserRoom = function (socket) {
    var roomId = getUserRoom(socket);
    if (roomId) {
        var room = rooms.get(roomId);
        if ((room === null || room === void 0 ? void 0 : room.ownerId) == socket.id) {
            destroyRoom(roomId);
        }
        else {
            leaveRoom(socket, roomId);
        }
    }
    else {
        socket.emit("leaveRoom", { reason: "Unkown room" });
    }
};
/**
 * Quitte une salle
 */
var leaveRoom = function (socket, roomId) {
    var room = rooms.get(roomId);
    if (room) {
        room.users = room.users.filter(function (userId) {
            return userId != socket.id;
        });
    }
    socket.emit("leaveRoom", { reason: "Leaved" });
};
var sendToRoom = function (roomId, message, data) {
    var room = rooms.get(roomId);
    if (room) {
        io.to(room.ownerId).emit(message, __assign(__assign({}, data), { isOwner: true }));
        room.users.forEach(function (userId) {
            io.to(userId).emit(message, __assign(__assign({}, data), { isOwner: false }));
        });
    }
};
//#endregion
io.on("connection", function (socket) {
    // Infos de l'utilisateur du socket
    console.log("[+] New connexion !");
    socket.on("createNewRoom", function (_) {
        // Leave his room if he has
        leaveUserRoom(socket);
        var roomId = createNewRoom(socket); // TODO : Options
        socket.emit("roomCreated", { roomId: roomId });
    });
    socket.on("joinRoom", function (data) {
        var roomId = data.roomId;
        if (!existRoom(roomId)) {
            socket.emit("roomDoesNotExist", {});
            return;
        }
        joinRoom(socket, roomId);
        socket.emit("roomJoined", { roomId: roomId });
    });
    socket.on("leaveRoom", function (data) {
        leaveUserRoom(socket);
    });
    socket.on("addMusic", function (data) {
        if (hasRoom(socket)) {
            var roomId = getUserRoom(socket);
            sendToRoom(roomId, "addMusic", data);
        }
    });
    socket.on("disconnect", function (data) {
        leaveUserRoom(socket);
        console.log("[-] Disconnexion !");
    });
});
//#region HTTP Request Manager
// const cors = require("cors");
// require("../manageRequest.ts")(app);
// app.use(cors());
app.get("/", function (req, res) {
    res.send("Hello World!");
});
var clientId = "9964dec0f948404eb6b0285252a65f1d";
var clientSecret = "a0c98b0ef7f84369a72495e627e5fb50";
app.get("/callback", function (req, res) {
    if (req.query.code) {
        var auth = base_64_1.encode(clientId + ":" + clientSecret);
        var code = req.query.code;
        var socketId_1 = req.query.state;
        var redirect_uri = encodeURIComponent("http://" + hostname + ":" + port + "/callback");
        fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: "Basic " + auth,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=authorization_code&code=" + code + "&redirect_uri=" + redirect_uri
        })
            .then(function (res) { return res.json(); })
            .then(function (json) {
            var tokens = {
                token: json.access_token,
                tokenExpiration: new Date().getTime() + json.expires_in * 1000,
                refreshToken: json.refresh_token
            };
            io.to(socketId_1).emit("spotifyConnexionResponse", tokens);
        })["catch"](function (err) { return console.log(err); });
    }
    res
        .status(200)
        .send("Vous avez lié votre compte Spotify à Comunify. Vous pouvez retourner sur l'application. 🚀");
});
//#endregion
