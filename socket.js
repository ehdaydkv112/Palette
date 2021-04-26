const socketIo = require("socket.io")
const { Chat, User } = require("./model")
const moment = require("moment")
require("moment-timezone")
moment.tz.setDefault("Asia/Seoul")

module.exports = async (http, app) => {
  const io = socketIo(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  const chat = io.of("/chat")
  const global = io.of("/")

  chat.on("connection", function (socket) {
    socket.on("join", async function (data) {
      const req = socket.request
      const {
        headers: { referer },
      } = req
      console.log(referer)
      const { room, username } = data
      // room에 join한다
      socket.join(room)
      // room에 join되어 있는 클라이언트에게 메시지를 전송한다
      const chats = await Chat.find({ room: room })
      chat.to(room).emit("load", chats)
    })

    socket.on("send", async function (data) {
      const { room } = data
      const content = new Chat({
        ...data,
        createdAt: moment().format("YYYY-MM-DD-HH:mm"),
      })
      await content.save()
      chat.to(room).emit("receive", content)
    })

    socket.on("leave", (data) => {
      console.log("leave")
      socket.leave(data.room)
    })

    socket.on("disconnect", () => {
      console.log("disconnect")
    })
  })

  global.on("connection", function (socket) {
    socket.on("globalSend", async function (data) {
      console.log(data)
      global.emit("globalReceive", data)
    })
  })
}
