const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

let users = {}

io.on("connection", socket => {
  console.log("User connected:", socket.id)

  socket.on("join", username => {
    users[socket.id] = username
    io.emit("users", users)
  })

  socket.on("call", targetId => {
    io.to(targetId).emit("incoming-call", {
      fromId: socket.id,
      fromName: users[socket.id]
    })
  })

  socket.on("disconnect", () => {
    delete users[socket.id]
    io.emit("users", users)
  })
})

server.listen(3000, () => {
  console.log("📞 Retro Phone Server running on port 3000")
})
