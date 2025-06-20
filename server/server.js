const express = require("express")
const http = require("http")
const cors = require("cors")
const { setupSocket } = require("./socket")

const app = express()
const server = http.createServer(app)

// Middleware
app.use(cors())
app.use(express.json())

// Socket.io setup
setupSocket(server)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
