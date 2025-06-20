const socketIo = require("socket.io");
const pollHandlers = require("./pollHandlers");
const studentHandlers = require("./studentHandlers");
const teacherHandlers = require("./teacherHandlers");
const chatHandlers = require("./chatHandlers");

function setupSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    pollHandlers(io, socket);
    studentHandlers(io, socket);
    teacherHandlers(io, socket);
    chatHandlers(io, socket);
  });
}

module.exports = { setupSocket }; 