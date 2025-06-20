const { v4: uuidv4 } = require("uuid");
const store = require("../storage/memoryStore");
const { startPollTimer } = require("../utils/timer");

module.exports = function pollHandlers(io, socket) {
  // Teacher creates poll
  socket.on("create-poll", (data) => {
    store.currentPoll = {
      id: uuidv4(),
      ...data,
      isActive: false,
      responses: {},
      totalResponses: 0,
      timeRemaining: data.duration,
      createdAt: new Date().toISOString(),
    };
    // Reset all student response status
    store.students.forEach((student) => {
      student.hasResponded = false;
      student.selectedOption = null;
      student.answeredCorrectly = null;
    });
    io.emit("poll-created", store.currentPoll);
    io.emit("students-updated", Array.from(store.students.values()));
  });

  // Teacher starts poll
  socket.on("start-poll", () => {
    if (store.currentPoll) {
      store.currentPoll.isActive = true;
      store.currentPoll.timeRemaining = store.currentPoll.duration;
      store.currentPoll.startedAt = new Date().toISOString();
      store.students.forEach((student) => {
        student.hasResponded = false;
        student.selectedOption = null;
        student.answeredCorrectly = null;
      });
      io.emit("poll-started", store.currentPoll);
      io.emit("students-updated", Array.from(store.students.values()));
      startPollTimer(store.currentPoll, io, store.pollHistory, store.chatMessages);
    }
  });

  // Teacher stops poll
  socket.on("stop-poll", () => {
    if (store.currentPoll) {
      store.currentPoll.isActive = false;
      store.currentPoll.timeRemaining = 0;
      store.currentPoll.endedAt = new Date().toISOString();
      store.pollHistory.unshift({ ...store.currentPoll });
      if (store.pollHistory.length > 10) {
        store.pollHistory = store.pollHistory.slice(0, 10);
      }
      io.emit("poll-stopped", store.currentPoll);
      io.emit("poll-history-updated", store.pollHistory);
    }
  });

  // Student submits response
  socket.on("submit-response", (data) => {
    const { optionIndex } = data;
    const student = store.students.get(socket.id);
    if (!store.currentPoll || !store.currentPoll.isActive || !student || student.hasResponded) {
      socket.emit("response-error", { message: "Cannot submit response" });
      return;
    }
    store.pollResponses.set(socket.id, optionIndex);
    student.hasResponded = true;
    student.selectedOption = optionIndex;
    const isCorrect = store.currentPoll.correctAnswers && store.currentPoll.correctAnswers.includes(optionIndex);
    student.answeredCorrectly = isCorrect;
    if (!store.currentPoll.responses[optionIndex]) {
      store.currentPoll.responses[optionIndex] = 0;
    }
    store.currentPoll.responses[optionIndex]++;
    store.currentPoll.totalResponses++;
    io.emit("poll-updated", store.currentPoll);
    io.emit("students-updated", Array.from(store.students.values()));
    socket.emit("response-success", { poll: store.currentPoll, isCorrect });
  });
}; 