const store = require("../storage/memoryStore");

module.exports = function studentHandlers(io, socket) {
  // Student joins
  socket.on("join-student", (data) => {
    const { username } = data;
    const existingStudent = Array.from(store.students.values()).find((s) => s.username === username);
    if (existingStudent) {
      socket.emit("join-error", { message: "Username already taken" });
      return;
    }
    const student = {
      id: socket.id,
      username,
      isOnline: true,
      hasResponded: false,
      joinedAt: new Date().toISOString(),
    };
    store.students.set(socket.id, student);
    socket.emit("current-poll", store.currentPoll);
    io.emit("students-updated", Array.from(store.students.values()));
    socket.emit("join-success", { student });
  });

  // Remove student
  socket.on("remove-student", (data) => {
    const { studentId } = data;
    const student = store.students.get(studentId);
    if (student) {
      const studentSocket = io.sockets.sockets.get(studentId);
      if (studentSocket) {
        studentSocket.emit("kicked-out", {
          message: "You have been removed from the classroom by the teacher.",
        });
      }
      store.students.delete(studentId);
      store.pollResponses.delete(studentId);
      io.emit("students-updated", Array.from(store.students.values()));
    }
  });

  // Get students
  socket.on("get-students", () => {
    socket.emit("students-updated", Array.from(store.students.values()));
  });

  // Disconnect
  socket.on("disconnect", () => {
    const wasStudent = store.students.has(socket.id);
    store.students.delete(socket.id);
    store.pollResponses.delete(socket.id);
    if (wasStudent) {
      io.emit("students-updated", Array.from(store.students.values()));
    }
  });
}; 