const store = require("../storage/memoryStore");

module.exports = function teacherHandlers(io, socket) {
  // Teacher joins
  socket.on("join-teacher", (data) => {
    const { teacherName } = data;
    const teacher = {
      id: socket.id,
      username: teacherName || "Teacher",
      isOnline: true,
      isTeacher: true,
      joinedAt: new Date().toISOString(),
    };
    store.teachers.set(socket.id, teacher);
    socket.emit("join-success", { user: teacher });
    socket.emit("students-updated", Array.from(store.students.values()));
    io.emit("students-updated", Array.from(store.students.values()));
  });

  // Disconnect
  socket.on("disconnect", () => {
    const wasTeacher = store.teachers.has(socket.id);
    store.teachers.delete(socket.id);
    if (wasTeacher) {
      io.emit("students-updated", Array.from(store.students.values()));
    }
  });
}; 