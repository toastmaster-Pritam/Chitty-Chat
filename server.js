const path = require("path");
const express = require("express");
const app = express();
const http = require("http").createServer(app);

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//socket.io setup
const { Server } = require("socket.io");
const io = new Server(http);

let users = {};

io.on("connection", (socket) => {
  socket.on("new-user-joined", (username) => {
    //server on receiving the event new-user-joined makes a callback
    users[socket.id] = username;
    // console.log(users)
    socket.broadcast.emit("user-connected", username); //boradcast function emits to everyone except the person who joined an event
    io.emit("user-list", users);
  });
  socket.on("disconnect", () => {
    //disconnect is a default event like connection
    let user;
    socket.broadcast.emit("user-disconnected", (user = users[socket.id]));
    delete users[socket.id];
    io.emit("user-list", users);
  });
  socket.on("message", (data) => {
    socket.broadcast.emit("message", data);
  });
});

app.get("/", (req, res) => {
  res.render("index", { users });
});

http.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
