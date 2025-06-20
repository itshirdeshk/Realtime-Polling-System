const { v4: uuidv4 } = require("uuid");
const store = require("../storage/memoryStore");

module.exports = function chatHandlers(io, socket) {
  // Send message
  socket.on("send-message", (data) => {
    const { message, type = "public", recipientId } = data;
    const sender = store.students.get(socket.id) || store.teachers.get(socket.id);
    if (!sender || !message.trim()) return;
    const chatMessage = {
      id: uuidv4(),
      senderId: socket.id,
      senderName: sender.username,
      message: message.trim(),
      type,
      recipientId,
      timestamp: new Date().toISOString(),
    };
    if (type === "private" && recipientId) {
      const conversationId = [socket.id, recipientId].sort().join("-");
      if (!store.privateMessages.has(conversationId)) {
        store.privateMessages.set(conversationId, []);
      }
      store.privateMessages.get(conversationId).push(chatMessage);
      socket.emit("private-message", chatMessage);
      const recipientSocket = io.sockets.sockets.get(recipientId);
      if (recipientSocket) {
        recipientSocket.emit("private-message", chatMessage);
      }
    } else {
      store.chatMessages.push(chatMessage);
      if (store.chatMessages.length > 100) {
        store.chatMessages.shift();
      }
      io.emit("new-message", chatMessage);
    }
  });

  // Get chat history
  socket.on("get-chat-history", () => {
    socket.emit("chat-history", store.chatMessages);
  });

  // Get private conversation
  socket.on("get-private-conversation", (data) => {
    const { participantId } = data;
    const conversationId = [socket.id, participantId].sort().join("-");
    const messages = store.privateMessages.get(conversationId) || [];
    socket.emit("private-conversation", { participantId, messages });
  });
}; 