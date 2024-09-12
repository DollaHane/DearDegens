const { Server } = require("socket.io")
const CHAT_BOT = "ChatBot"

// Create a socket.io server
const ioHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    console.log("*First use, starting Socket.IO")
    const io = new Server(res.socket.server)

    // Listen for connection events
    io.on("connection", (socket: any) => {
      console.log(`Socket ${socket.id} connected.`)

      // JOIN ROOM
      socket.on("join_room", (data: any) => {
        const username = data.username
        const room = data.room
        console.log("data:", username, room)
        socket.join(room)

        let __createdtime__ = Date.now()

        socket.to(room).emit("receive_message", {
          room: room,
          message: `${username} has joined the chat room`,
          username: CHAT_BOT,
          __createdtime__,
        })

        socket.emit("receive_message", {
          room: room,
          message: `Welcome ${username}`,
          username: CHAT_BOT,
          __createdtime__,
        })
      })

      // SEND MESSAGE
      socket.on("send_message", (data: any) => {
        const { room, message, username } = data
        let __createdtime__ = Date.now()
        console.log("send data:", data)
        io.to(room).emit("receive_message", {
          room: room,
          message: message,
          username: username,
          __createdtime__,
        })
      })

      // Clean up the socket on disconnect
      socket.on("disconnect", () => {
        console.log(`Socket ${socket.id} disconnected.`)
      })
    })
    res.socket.server.io = io
  }
  res.end()
}

module.exports = ioHandler

