require("dotenv").config()
const mongoose = require("mongoose")
const db = require("./config/db")
const Chat = require("./models/Chat")
const express = require("express")
const cors = require("cors")
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
})

// allow cors
app.use(
  cors({
    origin: "*",
  })
)

// call the db function to connect to the Database
db()

io.on("connection", (socket) => {
  console.log("socket is connected")
  // when an input comes to the server
  socket.on("input", async function (data) {
    let name = data.name
    let message = data.message

    // check if the name and message is not empty string
    if (name === "" || message === "") {
      socket.emit("status", "Please enter a name and message")
    } else {
      try {
        // INSERT MESSAGE INTO THE DATABASE
        const doc = await Chat.create({
          name,
          message,
        })

        // if document is inserted successfully
        if (doc) {
          // send the data back
          socket.emit("output", [data])

          //   send successful message
          socket.emit("status", { message: "message sent", clear: true })
        }
      } catch (error) {
        console.log(error)
      }
    }
  })

  //   when clear button is pressed
  socket.on("clear", async function (data) {
    // remove all chats from DB
    const deletedCount = await Chat.deleteMany({})

    // if documents successfully deleted
    if (deletedCount) {
      socket.emit("cleared")
    }
  })
})

app.get("/", (req, res) => {
  res.send("Connected..")
})

httpServer.listen(5000)
